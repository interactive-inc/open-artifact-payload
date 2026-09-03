import { defineConfig, devices } from "@playwright/test"

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
import "dotenv/config"

import { e2eTurnstileKeys } from "./tests/helpers/e2e-fixtures"

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  // Next/Payloadのcold compileをbeforeAllやnavigationの30秒枠に含めても
  // 各テストが途中で打ち切られないようにする。
  timeout: 120_000,
  expect: {
    timeout: 30_000,
  },
  globalTeardown: "./tests/e2e/global-teardown.ts",
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* ローカル D1 (SQLite) は並列アクセスで SQLITE_BUSY になるため常に直列実行する */
  workers: 1,
  /* 進行状況はターミナルに出し、失敗の詳細は playwright-report/ に残す */
  reporter: [["list"], ["html", { open: "never" }]],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: 'http://localhost:3000',

    /* retries=0 のローカルでも失敗を追えるよう、失敗したテストの trace だけ残す */
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], channel: "chromium" },
    },
  ],
  webServer: {
    // Next devと同時に別のMiniflareを開くとローカルD1が競合するため、
    // 専用D1の作り直し・マイグレーション・フィクスチャ投入はサーバー起動前に済ませる。
    command: "vp exec tsx tests/helpers/prepare-e2e.ts && bun dev",
    env: {
      PAYLOAD_SECRET: process.env.PAYLOAD_SECRET ?? "test-secret-do-not-use-in-production",
      // 開発用の .wrangler/state とは別のローカル D1 / R2 を使う
      CLOUDFLARE_PERSIST_PATH: ".wrangler/state-e2e",
      // Cloudflare のテスト用シークレット。siteverify は常に success を返す
      TURNSTILE_SECRET_KEY: e2eTurnstileKeys.secretKey,
    },
    reuseExistingServer: false,
    // マイグレーションとフィクスチャ投入を含むため dev 起動だけより長く待つ
    timeout: 240_000,
    stdout: "pipe",
    stderr: "pipe",
    url: "http://localhost:3000",
  },
})
