import { test, expect, type Page } from "@playwright/test"

import { login } from "../helpers/login"
import { testUser } from "../helpers/seed-user"

// enableAnalytics を false にした案件では設定 Global が無く、REST は 404 を返す
async function skipWithoutAnalytics(page: Page): Promise<void> {
  const response = await page.request.get("http://localhost:3000/api/globals/analytics-settings")
  test.skip(response.status() === 404, "enableAnalytics が無効な案件")
}

test.describe("ダッシュボードのアクセス解析", () => {
  test("admin は取得済みの数字・人気ページ・流入元を見られる", async ({ page }) => {
    await login({ page, user: testUser })
    await skipWithoutAnalytics(page)

    const panel = page.getByRole("region", { name: "アクセス解析" })
    await expect(panel).toBeVisible({ timeout: 60_000 })
    await expect(panel.getByText("1,284")).toBeVisible()
    await expect(panel.getByRole("heading", { name: "人気ページ" })).toBeVisible()
    await expect(panel.getByText("/works/brand-renewal")).toBeVisible()
    await expect(panel.getByText("自然検索")).toBeVisible()
    await expect(panel.getByRole("link", { name: "28日" })).toHaveAttribute("aria-current", "true")
  })

  test("取得済みの結果が無い期間に切り替えると、鍵の確認を促す", async ({ page }) => {
    await login({ page, user: testUser })
    await skipWithoutAnalytics(page)

    const panel = page.getByRole("region", { name: "アクセス解析" })
    await panel.getByRole("link", { name: "7日" }).click()

    await expect(page).toHaveURL(/range=7d/)
    await expect(panel.getByText(/鍵の設定を確認してください/)).toBeVisible({ timeout: 60_000 })
    await expect(panel.getByText(/件$/).first()).toBeVisible()
  })

  test("見られるロールに含まれない editor にはパネルを出さない", async ({ page, browser }) => {
    await login({ page, user: testUser })
    await skipWithoutAnalytics(page)
    const editor = {
      email: `analytics-editor-${Date.now()}@example.com`,
      password: "test-password-1234",
    }
    const created = await page.request.post("http://localhost:3000/api/users", {
      data: { ...editor, roles: ["editor"] },
    })
    expect(created.ok()).toBe(true)

    const editorContext = await browser.newContext()
    const editorPage = await editorContext.newPage()
    await login({ page: editorPage, user: editor })

    await expect(editorPage.getByRole("heading", { name: "今日は何をしますか?" })).toBeVisible()
    await expect(editorPage.getByRole("region", { name: "アクセス解析" })).toHaveCount(0)
    await editorContext.close()
  })
})
