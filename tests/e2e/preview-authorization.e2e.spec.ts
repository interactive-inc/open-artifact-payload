import { expect, test } from "@playwright/test"

import { login } from "../helpers/login"
import { previewMcpApiKeys, previewUser } from "../helpers/seed-user"

test.describe("Preview authorization", () => {
  test("未認証とMCP API KeyではDraft Mode cookieを発行しない", async ({ request }) => {
    const cases = [
      undefined,
      `payload-mcp-api-keys API-Key ${previewMcpApiKeys.active}`,
      `payload-mcp-api-keys API-Key ${previewMcpApiKeys.expired}`,
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
