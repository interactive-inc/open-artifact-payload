import { defineConfig, devices } from "@playwright/test"

const isStatic = process.env.STORYBOOK_MODE === "static"
const port = isStatic ? 6007 : 6006
const baseURL = `http://127.0.0.1:${port}`

export default defineConfig({
  testDir: "./tests/storybook",
  timeout: 300_000,
  expect: { timeout: 10_000 },
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: "line",
  use: {
    ...devices["Desktop Chrome"],
    baseURL,
    trace: "retain-on-failure",
  },
  webServer: {
    command: isStatic
      ? `vp exec tsx tests/helpers/serve-storybook-static.ts ${port}`
      : `vp exec storybook dev -p ${port} --ci --no-open`,
    reuseExistingServer: false,
    timeout: 120_000,
    url: baseURL,
  },
})
