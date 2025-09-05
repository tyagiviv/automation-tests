// server.js
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 4000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const reportsDir = path.join(__dirname, '../reports');
const indexHtmlPath = path.join(__dirname, 'index.html');

// Serve favicon and other static files
app.use(express.static(__dirname));
app.use('/reports', express.static(reportsDir));

app.get('/', (req, res) => res.sendFile(indexHtmlPath));

// ==================== countTests ====================
function countTests(suite) {
  let stats = {};

  if (suite.specs) {
    suite.specs.forEach(spec => {
      if (spec.tests) {
        spec.tests.forEach(test => {
          if (test.results) {
            let firstFailed = false; 
            test.results.forEach((result, index) => {
              let status = result.status || 'unknown';

              if (index === 0 && status === 'failed') firstFailed = true;
              if (firstFailed && status === 'passed') status = 'flaky';

              stats[status] = (stats[status] || 0) + 1;
            });
          }
        });
      }
    });
  }

  if (suite.suites) {
    suite.suites.forEach(childSuite => {
      const childStats = countTests(childSuite);
      for (const [status, count] of Object.entries(childStats)) {
        stats[status] = (stats[status] || 0) + count;
      }
    });
  }

  return stats;
}

// ==================== getTestsByStatus ====================
function getTestsByStatus(suite, map = {}) {
  const allStatuses = ['passed','failed','skipped','flaky','timedout','unknown'];
  allStatuses.forEach(s => map[s] = map[s] || []);

  if (suite.specs) {
    suite.specs.forEach(spec => {
      if (spec.tests) {
        spec.tests.forEach(test => {
          if (test.results) {
            let firstFailed = false;
            test.results.forEach((result, idx) => {
              let status = (result.status || 'unknown').toLowerCase();

              if (idx === 0 && status === 'failed') firstFailed = true;
              if (firstFailed && status === 'passed') status = 'flaky';

              const testTitle = spec.title || 'Unnamed Test';
              if (!map[status].includes(testTitle)) map[status].push(testTitle);
            });
          }
        });
      }
    });
  }

  if (suite.suites) suite.suites.forEach(child => getTestsByStatus(child, map));

  return map;
}

// ==================== getTotalTime ====================
function getTotalTime(suite) {
  let total = 0;

  if (suite.specs) {
    suite.specs.forEach(spec => {
      if (spec.tests) {
        spec.tests.forEach(test => {
          if (test.results) {
            test.results.forEach(result => {
              total += result.duration || 0;
            });
          }
        });
      }
    });
  }

  if (suite.suites) {
    suite.suites.forEach(childSuite => {
      total += getTotalTime(childSuite);
    });
  }

  return total;
}

// ======== Helpers =========
function folderDate(folderName) {
  return folderName.slice(0, 10); 
}

function inDateRange(dateStr, start, end) {
  if (!start || !end) return true;
  return dateStr >= start && dateStr <= end;
}

function formatDuration(ms) {
  let totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  totalSeconds %= 3600;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

// ==================== /api/runs ====================
app.get('/api/runs', (req, res) => {
  if (!fs.existsSync(reportsDir)) return res.json([]);

  const startDate = req.query.start || null;
  const endDate = req.query.end || null;

  const folders = fs.readdirSync(reportsDir)
    .filter(f => {
      const fullPath = path.join(reportsDir, f);
      if (!fs.statSync(fullPath).isDirectory()) return false;
      if (!fs.existsSync(path.join(fullPath, 'results.json'))) return false;
      const d = folderDate(f);
      return inDateRange(d, startDate, endDate);
    })
    .sort((a, b) => b.localeCompare(a));

  const runs = folders.map(folder => {
    const jsonPath = path.join(reportsDir, folder, 'results.json');

    let stats = {};
    let testsByStatus = {};
    let totalTimeMs = 0;

    try {
      const json = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

      if (json.stats && json.stats.duration != null) {
        totalTimeMs = json.stats.duration;
      } else if (json.startTime && json.endTime) {
        totalTimeMs = new Date(json.endTime) - new Date(json.startTime);
      } else if (json.suites) {
        json.suites.forEach(suite => {
          totalTimeMs += getTotalTime(suite);
        });
      }

      if (json.suites) {
        json.suites.forEach(suite => {
          const s = countTests(suite);
          for (const [status, count] of Object.entries(s)) {
            stats[status] = (stats[status] || 0) + count;
          }

          testsByStatus = getTestsByStatus(suite, testsByStatus);
        });
      }

    } catch (err) {
      console.error(`Failed to parse JSON for ${folder}`, err);
      return null;
    }

    return {
      timestamp: folder,
      date: folderDate(folder),
      htmlReport: `/reports/${folder}/html-report/index.html`,
      stats,
      testsByStatus,
      totalTime: formatDuration(totalTimeMs)
    };
  }).filter(run => run !== null);

  res.json(runs);
});

// ==================== /api/archive ====================
app.get('/api/archive', (req, res) => {
  if (!fs.existsSync(reportsDir)) return res.json({});

  const folders = fs.readdirSync(reportsDir)
    .filter(f => {
      const fullPath = path.join(reportsDir, f);
      return fs.statSync(fullPath).isDirectory() && fs.existsSync(path.join(fullPath, 'results.json'));
    });

  const tree = {};
  for (const f of folders) {
    const date = folderDate(f);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
    const year = date.slice(0, 4);
    const month = date.slice(5, 7);
    tree[year] = tree[year] || {};
    tree[year][month] = tree[year][month] || new Set();
    tree[year][month].add(date);
  }

  for (const y of Object.keys(tree)) {
    for (const m of Object.keys(tree[y])) {
      tree[y][m] = Array.from(tree[y][m]).sort().reverse();
    }
  }

  res.json(tree);
});

app.listen(PORT, () => {
  console.log(`Dashboard running at http://localhost:${PORT}`);
});
