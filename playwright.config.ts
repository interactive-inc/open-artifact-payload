import { defineConfig, devices } from "@playwright/test"

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
import "dotenv/config"

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* ローカル D1 (SQLite) は並列アクセスで SQLITE_BUSY になるため常に直列実行する */
  workers: 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: "html",
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], channel: "chromium" },
    },
  ],
  webServer: {
    // Next devと同時に別のMiniflareを開くとローカルD1が競合するため、
    // E2Eユーザーはサーバー起動前に準備して接続を閉じる。
    command: "vp exec tsx tests/helpers/seed-user-cli.ts && bun dev",
    env: {
      PAYLOAD_SECRET: process.env.PAYLOAD_SECRET ?? "test-secret-do-not-use-in-production",
    },
    reuseExistingServer: false,
    url: "http://localhost:3000",
  },
})
