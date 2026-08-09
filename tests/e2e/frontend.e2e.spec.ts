import { test, expect } from "@playwright/test"

test.describe("Frontend", () => {
  test("トップページが表示される", async ({ page }) => {
    await page.goto("http://localhost:3000")
    // タイトルは site-settings のサイト名から動的生成されるため、空でないことだけ確認する
    await expect(page).toHaveTitle(/.+/)
  })

  test("お知らせ一覧ページが表示される", async ({ page }) => {
    await page.goto("http://localhost:3000/news")
    await expect(page.locator("h1", { hasText: "お知らせ" })).toBeVisible()
  })

  test("FAQ ページが表示される", async ({ page }) => {
    await page.goto("http://localhost:3000/faq")
    await expect(page.locator("h1", { hasText: "よくある質問" })).toBeVisible()
  })

  test("お問い合わせページにフォームが表示される", async ({ page }) => {
    await page.goto("http://localhost:3000/contact")
    await expect(page.locator("h1", { hasText: "お問い合わせ" })).toBeVisible()
    await expect(page.locator('input[name="name"]')).toBeVisible()
    await expect(page.locator('input[name="email"]')).toBeVisible()
    await expect(page.locator('textarea[name="message"]')).toBeVisible()
  })
})
