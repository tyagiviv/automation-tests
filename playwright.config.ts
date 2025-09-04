import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { fileURLToPath } from 'url';

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use a single timestamp for the entire test run (can be overridden via env variable)
const timestamp = process.env.RUN_TIMESTAMP || new Date().toISOString().replace(/[:.]/g, '-');
const reportPath = path.join(__dirname, 'reports', timestamp);

// Create report folder if it doesn't exist
if (!fs.existsSync(reportPath)) fs.mkdirSync(reportPath, { recursive: true });

// Calculate dynamic workers
// You can set a base number like 5 tests per worker
const testCountEstimate = 50; // adjust if you know approximate number of tests
const estimatedWorkers = Math.ceil(testCountEstimate / 5);
const maxCores = os.cpus().length;
const workersToUse = Math.min(estimatedWorkers, maxCores);


export default defineConfig({
  testDir: './tests',
  testMatch: ['**/*.ts'],
  fullyParallel: true, // keep parallel execution
  retries: 1,
  outputDir: path.join(reportPath, 'artifacts'),
  reporter: [
    ['html', { outputFolder: path.join(reportPath, 'html-report'), open: 'never' }],
    ['json', { outputFile: path.join(reportPath, 'results.json') }],
    ['list'],
  ],

  projects: [
    {
      name: 'dev',
      use: {
        ...devices['Desktop Chrome'],
        headless: true,
        viewport: { width: 1280, height: 720 },
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        trace: 'on-first-retry',
        actionTimeout: 60000,
        baseURL: 'https://dev.automationexercise.com',
      },
    },
    {
      name: 'staging',
      use: {
        ...devices['Desktop Chrome'],
        headless: true,
        viewport: { width: 1280, height: 720 },
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        trace: 'on-first-retry',
        actionTimeout: 60000,
        baseURL: 'https://staging.automationexercise.com',
      },
    },
    {
      name: 'prod',
      use: {
        ...devices['Desktop Chrome'],
        headless: true,
        viewport: { width: 1280, height: 720 },
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        trace: 'on-first-retry',
        actionTimeout: 60000,
        baseURL: 'https://www.automationexercise.com',
      },
    },
  ],
});
