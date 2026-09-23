import { defineConfig } from "@playwright/test"

import "dotenv/config"

/** Dedicated local Worker with the same Basic gate as shared development. All credentials are fixtures. */
export default defineConfig({
  testDir: "./tests/development-access",
  timeout: 120_000,
  workers: 1,
  forbidOnly: !!process.env.CI,
  reporter: "list",
  use: {
    baseURL: "https://localhost:3000",
    ignoreHTTPSErrors: true,
    trace: "retain-on-failure",
  },
  webServer: {
    command:
      "vp exec tsx tests/helpers/prepare-e2e.ts && vp run preview --local --local-protocol https --persist-to .wrangler/state-basic-e2e --var NEXT_PUBLIC_SERVER_URL:https://localhost:3000 --var PAYLOAD_SECRET:basic-e2e-payload-secret --var BASIC_AUTH_ENABLED:true --var BASIC_AUTH_USERNAME:basic-e2e --var BASIC_AUTH_PASSWORD:basic-e2e-password",
    env: {
      PAYLOAD_SECRET: "basic-e2e-payload-secret",
      CLOUDFLARE_PERSIST_PATH: ".wrangler/state-basic-e2e/v3",
    },
    url: "https://localhost:3000/admin/",
    ignoreHTTPSErrors: true,
    timeout: 240_000,
    reuseExistingServer: false,
    stdout: "pipe",
    stderr: "pipe",
  },
})
