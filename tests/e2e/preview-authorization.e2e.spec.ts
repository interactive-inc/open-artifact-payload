import { expect, test } from "@playwright/test"

import { login } from "../helpers/login"
import { previewMcpApiKeys, previewUser } from "../helpers/seed-user"
import { e2eFixtures } from "../helpers/e2e-fixtures"

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

  test("プレビューCookieだけ・ログアウト済みセッションでは下書き本文とメタデータを返さない", async ({
    page,
    browser,
  }) => {
    await login({ page, user: previewUser })
    await page.goto("http://localhost:3000/next/preview?path=/ja")
    const cookies = await page.context().cookies()
    const draftCookie = cookies.find((cookie) => cookie.name === "__prerender_bypass")
    expect(draftCookie).toBeDefined()
    if (!draftCookie) throw new Error("プレビューCookieが発行されませんでした")

    const cookieOnly = await browser.newContext()
    const replay = await browser.newContext()
    try {
      await cookieOnly.addCookies([draftCookie])
      await replay.addCookies(cookies)
      const drafts = [
        { collection: "news", ...e2eFixtures.draftNews },
        { collection: "works", ...e2eFixtures.draftWork },
      ]
      for (const draft of drafts) {
        const url = `http://localhost:3000/ja/${draft.collection}/${draft.slug}`
        const authenticated = await page.request.get(url)
        expect(authenticated.status()).toBe(200)
        expect(await authenticated.text()).toContain(draft.title)
        const anonymous = await cookieOnly.request.get(url)
        expect(anonymous.status()).toBe(404)
        expect(await anonymous.text()).not.toContain(draft.title)
      }

      const logout = await page.request.post("http://localhost:3000/api/users/logout")
      expect(logout.ok()).toBe(true)
      for (const draft of drafts) {
        const response = await replay.request.get(
          `http://localhost:3000/ja/${draft.collection}/${draft.slug}`,
        )
        expect(response.status()).toBe(404)
        expect(await response.text()).not.toContain(draft.title)
      }
    } finally {
      await cookieOnly.close()
      await replay.close()
    }
  })
})
