# Playwright POM Framework

This is a **Playwright Page Object Model (POM) framework** using TypeScript for automated UI testing.  
It includes setup instructions, folder structure, example tests, and handling popups.

---

1️⃣ Initialize Node.js Project

```bash
mkdir playwright-pom-framework
cd playwright-pom-framework
npm init -y
Result: Creates package.json for your project.


2️⃣ Install Playwright and TypeScript
npm install --save-dev @playwright/test typescript ts-node @types/node


Result:
@playwright/test → Playwright test runner
typescript → TypeScript support
ts-node → Run TS files without compiling
@types/node → Node.js types for TypeScript


3️⃣ Install Playwright Browsers
npx playwright install

Result: Installs browser binaries (Chromium, Firefox, WebKit).

Optional: Generate code using codegen:

npx playwright codegen https://www.automationexercise.com


4️⃣ Initialize TypeScript Config
npx tsc --init


Update tsconfig.json:

{
  "compilerOptions": {
    "module": "nodenext",
    "target": "esnext",
    "strict": true,
    "moduleResolution": "node",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}


5️⃣ Create Playwright Config

playwright.config.ts:

import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  retries: 1,
  use: {
    headless: false,
    viewport: { width: 1280, height: 720 },
    screenshot: 'on',
    video: 'on',
    trace: 'on-first-retry',
    actionTimeout: 60000,
    baseURL: 'https://www.automationexercise.com',
  },
  reporter: [['html'], ['list']]
});


Notes:

baseURL allows using relative URLs: page.goto('/').

Headless mode is off for easier debugging.


6️⃣ Project Folder Structure
playwright-pom-framework/
├─ pages/
│  ├─ BasePage.ts       # Common page functions & popup handling
│  └─ HomePage.ts       # Home page POM
├─ tests/
│  └─ navigation.spec.ts # Example navigation test
├─ package.json
├─ tsconfig.json
└─ playwright.config.ts


Folders:

pages/ → Page Object Models (POM)

tests/ → Playwright test scripts

To run reports dashboard
npm install express - Install Express locally in your project: to run reports dashboard
node dashboard/server.js



Note: To remove cache and reports
rm -rf node_modules/.cache                                                                  
rm -rf playwright-report
rm -rf tests/.tsbuildinfo
  