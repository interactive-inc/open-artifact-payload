import { expect, test } from "@playwright/test"
import { getPayload, type Payload } from "payload"

import config from "../../src/payload.config.js"
import { login } from "../helpers/login"

const previewUser = {
  email: "preview-e2e@payloadcms.com",
  password: "test-password-1234",
}

let payload: Payload
let userId: number
const mcpKeyIds: number[] = []
let activeMcpApiKey = ""
let expiredMcpApiKey = ""

test.describe("Preview authorization", () => {
  test.beforeAll(async () => {
    payload = await getPayload({ config })
    await payload.delete({
      collection: "users",
      where: { email: { equals: previewUser.email } },
    })
    const user = await payload.create({
      collection: "users",
      data: { ...previewUser, roles: ["admin"] },
    })
    userId = user.id

    activeMcpApiKey = `preview-e2e-active-${crypto.randomUUID()}`
    expiredMcpApiKey = `preview-e2e-expired-${crypto.randomUUID()}`
    for (const [apiKey, expiresAt] of [
      [activeMcpApiKey, new Date(Date.now() + 60_000).toISOString()],
      [expiredMcpApiKey, new Date(Date.now() - 60_000).toISOString()],
    ] as const) {
      const key = await payload.create({
        collection: "payload-mcp-api-keys",
        data: {
          user: userId,
          label: "Preview E2E",
          enableAPIKey: true,
          apiKey,
          expiresAt,
          news: { find: true, create: false, update: false },
        },
      })
      mcpKeyIds.push(key.id)
    }
  })

  test.afterAll(async () => {
    for (const id of mcpKeyIds) {
      await payload.delete({ collection: "payload-mcp-api-keys", id })
    }
    await payload.delete({ collection: "users", id: userId })
  })

  test("未認証とMCP API KeyではDraft Mode cookieを発行しない", async ({ request }) => {
    const cases = [
      undefined,
      `payload-mcp-api-keys API-Key ${activeMcpApiKey}`,
      `payload-mcp-api-keys API-Key ${expiredMcpApiKey}`,
    ]

    for (const authorization of cases) {
      const response = await request.get("http://localhost:3000/next/preview?path=/ja", {
        headers: authorization ? { authorization } : undefined,
        maxRedirects: 0,
      })
      expect(response.status()).toBe(401)
      expect(response.headers()["set-cookie"]).toBeUndefined()
    }
  })

  test("管理画面セッションではDraft Modeを開始・終了できる", async ({ page }) => {
    await login({ page, user: previewUser })

    await page.goto("http://localhost:3000/next/preview?path=/ja")
    await expect(page).toHaveURL("http://localhost:3000/ja")
    expect(
      (await page.context().cookies()).some((cookie) => cookie.name === "__prerender_bypass"),
    ).toBe(true)

    await page.goto("http://localhost:3000/next/exit-preview?path=/ja")
    await expect(page).toHaveURL("http://localhost:3000/ja")
    expect(
      (await page.context().cookies()).some((cookie) => cookie.name === "__prerender_bypass"),
    ).toBe(false)
  })
})
