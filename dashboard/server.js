// server.js
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 4000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const reportsDir = path.join(__dirname, '../reports'); // All timestamped folders like YYYY-MM-DD_HH-mm-ss
// const archiveDir = path.join(__dirname, '../archive'); // ❌ REMOVED hard dependency (see below) // ==== CHANGED 0309 ====
const indexHtmlPath = path.join(__dirname, 'index.html');

// Serve favicon and other static files
app.use(express.static(__dirname));
app.use('/reports', express.static(reportsDir));

// ❌ No longer statically serving /archive from disk; we respond via /api/archive even if folder doesn't exist. // ==== CHANGED 0309 ====
// app.use('/archive', express.static(archiveDir));

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

// ======== NEW: normalize folder -> date-only (YYYY-MM-DD) ========
// Many folders are named "YYYY-MM-DD_HH-mm-ss". We only need the first 10 chars for date filtering.
// This fixes issues where only the last report showed up.
function folderDate(folderName) { // ==== NEW 0309 ====
  // Expect "YYYY-MM-DD" or "YYYY-MM-DD_HH-mm-ss"
  return folderName.slice(0, 10);
}

// ======== NEW: date helpers for inclusive range checks ===========
function inDateRange(dateStr, start, end) { // all "YYYY-MM-DD" // ==== NEW 0309 ====
  if (!start || !end) return true;
  return dateStr >= start && dateStr <= end;
}

app.get('/api/runs', (req, res) => {
  if (!fs.existsSync(reportsDir)) return res.json([]);

  // ==== CHANGED 0309: treat start/end as date-only strings (YYYY-MM-DD) ====
  const startDate = req.query.start || null;
  const endDate = req.query.end || null;

  const folders = fs.readdirSync(reportsDir)
    .filter(f => {
      const fullPath = path.join(reportsDir, f);
      if (!fs.statSync(fullPath).isDirectory()) return false;
      if (!fs.existsSync(path.join(fullPath, 'results.json'))) return false;

      // ✅ Compare by date prefix only (fixes "only last report shows")
      const d = folderDate(f);
      return inDateRange(d, startDate, endDate);
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
      timestamp: folder, // keep full folder name for linking and display
      date: folderDate(folder), // ==== NEW 0309 ====
      htmlReport: `/reports/${folder}/html-report/index.html`,
      stats
    };
  }).filter(run => run !== null);

  res.json(runs);
});

// ==================== /api/archive (virtual archive tree) ========
// Works even if there is no /archive directory. It groups /reports by YYYY-MM -> [YYYY-MM-DD...]
app.get('/api/archive', (req, res) => { // ==== CHANGED 0309 ====
  if (!fs.existsSync(reportsDir)) return res.json({});

  const folders = fs.readdirSync(reportsDir)
    .filter(f => {
      const fullPath = path.join(reportsDir, f);
      return fs.statSync(fullPath).isDirectory() && fs.existsSync(path.join(fullPath, 'results.json'));
    });

  // Build { 'YYYY-MM': Set{'YYYY-MM-DD', ...}, ... }
  const tree = {};
  for (const f of folders) {
    const date = folderDate(f); // YYYY-MM-DD
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
    const ym = date.slice(0, 7); // YYYY-MM
    tree[ym] = tree[ym] || new Set();
    tree[ym].add(date);
  }

  // Convert Sets to sorted arrays
  const archiveTree = Object.fromEntries(
    Object.entries(tree).map(([ym, datesSet]) => [ym, Array.from(datesSet).sort().reverse()])
  );

  res.json(archiveTree);
});

app.listen(PORT, () => {
  console.log(`Dashboard running at http://localhost:${PORT}`);
});
