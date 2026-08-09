import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E configuration for OtakuSaga.
 *
 * Tests run against the Next.js dev server. The `webServer` entry
 * boots `npm run dev` automatically and waits for port 3000 to respond.
 * Set `CI=true` to enable retries and forbid `.only` in CI pipelines.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'list',
  timeout: 30_000,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    // Override the inherited PORT (20128 here) so Next.js binds to 3000,
    // and force NODE_ENV=development — `next dev` needs it even when a
    // global NODE_ENV=production leaks in from the environment.
    command: 'PORT=3000 NODE_ENV=development npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
