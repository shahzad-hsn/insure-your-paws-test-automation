import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config({ quiet: true });

const isCI = !!process.env.CI;

export default defineConfig({
  timeout: 120000,
  expect: {
    timeout: 20000,
  },
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 2,
  workers: isCI ? 2 : 2,
  grep: process.env.GREP ? new RegExp(process.env.GREP) : undefined,
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
    ['allure-playwright', {
      resultsDir: 'allure-results',
      detail: true,
      suiteTitle: true,
    }],
    ...(isCI
      ? ([['junit', { outputFile: 'test-results/junit.xml' }]] as const)
      : []),
  ],
  use: {
    headless: isCI ? true : false,
    actionTimeout: 15000,
    navigationTimeout: 30000,
    // Fixed desktop viewport: in headless mode there is no OS window, so a
    // null viewport would fall back to 800x600 and render the MOBILE layout
    // (hamburger menu), breaking desktop-navigation tests.
    viewport: { width: 1440, height: 900 },
    baseURL: process.env.BASE_URL || 'https://staging.insureyourpaws.co.uk/',
    httpCredentials: {
      username: process.env.HTTP_USERNAME || '',
      password: process.env.HTTP_PASSWORD || '',
    },
    trace: 'on-first-retry',
    testIdAttribute: 'data-id',
    // Exactly one full-page screenshot per test (taken at the end); full page
    // because failures often involve elements below the fold that a
    // viewport-only capture crops out. Videos are kept for failed tests only.
    screenshot: { mode: 'on', fullPage: true },
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chrome',
      use: browserProjectUse(isCI),
    },
    {
      name: 'smoke',
      grep: /@smoke/,
      use: browserProjectUse(isCI),
    },
  ],
});

/** Local: real Chrome maximized. CI: bundled Chromium (no system Chrome required). */
function browserProjectUse(ci: boolean) {
  if (ci) {
    return {
      browserName: 'chromium' as const,
      viewport: { width: 1440, height: 900 },
      launchOptions: {
        args: ['--disable-web-security', '--disable-features=VizDisplayCompositor'],
      },
    };
  }
  return {
    channel: 'chrome' as const,
    viewport: null,
    launchOptions: {
      args: [
        '--start-maximized',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
      ],
    },
  };
}
