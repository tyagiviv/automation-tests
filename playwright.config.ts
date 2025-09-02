import { defineConfig } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use a single timestamp for the entire test run (can be overridden via env variable)
const timestamp = process.env.RUN_TIMESTAMP || new Date().toISOString().replace(/[:.]/g, '-');
const reportPath = path.join(__dirname, 'reports', timestamp);

// Create report folder if it doesn't exist
if (!fs.existsSync(reportPath)) fs.mkdirSync(reportPath, { recursive: true });

export default defineConfig({
  testDir: './tests',
  testMatch: ['**/*.ts'],
  fullyParallel: true, // keep parallel execution
  retries: 1,
  use: {
    headless: true,
    viewport: { width: 1280, height: 720 },
    screenshot: 'on',
    video: 'on',
    trace: 'on-first-retry',
    actionTimeout: 60000,
    baseURL: 'https://www.automationexercise.com',
  },
  outputDir: path.join(reportPath, 'artifacts'),
  reporter: [
    ['html', { outputFolder: path.join(reportPath, 'html-report'), open: 'never' }],
    ['json', { outputFile: path.join(reportPath, 'results.json') }],
    ['list'],
  ],
});
