import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for Miyabi SDK demo recording
 * See https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'html',

  use: {
    // Record video for all tests
    video: 'on',

    // Take screenshot on failure
    screenshot: 'on',

    // Collect trace on failure
    trace: 'on-first-retry',

    // Viewport size for demo
    viewport: { width: 1920, height: 1080 },

    // Slow down actions for visibility in demo
    launchOptions: {
      slowMo: 500,
    },
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Output directory for test artifacts
  outputDir: './output',
});
