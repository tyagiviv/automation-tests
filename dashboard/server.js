import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 4000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const reportsDir = path.join(__dirname, '../reports'); // All timestamped folders
const indexHtmlPath = path.join(__dirname, 'index.html');

// Serve favicon and other static files
app.use(express.static(__dirname)); // <-- ADD THIS LINE

app.use('/reports', express.static(reportsDir));

app.get('/', (req, res) => res.sendFile(indexHtmlPath));

// ==================== NEW FUNCTION: countTests ====================
// Dynamically counts all test statuses (passed, failed, skipped, etc.)
function countTests(suite) {
  let stats = {};

  // Count tests in specs
  if (suite.specs) {
    suite.specs.forEach(spec => {
      if (spec.tests) {
        spec.tests.forEach(test => {
          if (test.results) {
            test.results.forEach(result => {
              const status = result.status || 'unknown';
              stats[status] = (stats[status] || 0) + 1;
            });
          }
        });
      }
    });
  }

  // Recursively count child suites
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
// ================================================================

app.get('/api/runs', (req, res) => {
  if (!fs.existsSync(reportsDir)) return res.json([]);

  const folders = fs.readdirSync(reportsDir)
    .filter(f => {
      const fullPath = path.join(reportsDir, f);
      return fs.statSync(fullPath).isDirectory() &&
             fs.existsSync(path.join(fullPath, 'results.json')); // only folders with results.json
    })
    .sort((a, b) => b.localeCompare(a)); // latest first

  const runs = folders.map(folder => {
    const jsonPath = path.join(reportsDir, folder, 'results.json');

    let stats = {};
    try {
      const json = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

      if (json.suites) {
        json.suites.forEach(suite => {
          const s = countTests(suite); // use recursive function
          for (const [status, count] of Object.entries(s)) {
            stats[status] = (stats[status] || 0) + count;
          }
        });
      }

    } catch (err) {
      console.error(`Failed to parse JSON for ${folder}`, err);
      return null; // skip folders with invalid JSON
    }

    return {
      timestamp: folder,
      htmlReport: `/reports/${folder}/html-report/index.html`,
      stats
    };
  }).filter(run => run !== null); // remove invalid/null entries

  res.json(runs);
});

app.listen(PORT, () => {
  console.log(`Dashboard running at http://localhost:${PORT}`);
});
