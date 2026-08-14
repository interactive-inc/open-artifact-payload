import { expect, test } from "@playwright/test"

test.describe("News", () => {
  test("お知らせ一覧から記事が存在すれば詳細に遷移できる", async ({ page }) => {
    await page.goto("http://localhost:3000/news", { waitUntil: "networkidle" })

    const firstArticleLink = page.locator('a[href^="/news/"]').first()
    const linkCount = await firstArticleLink.count()
    if (linkCount === 0) {
      await expect(firstArticleLink).toHaveCount(0)
      return
    }

    await firstArticleLink.click()
    await expect(page).toHaveURL(/\/news\/.+/, { timeout: 30_000 })
    await expect(page.locator("h1, h2").first()).toBeVisible()
  })
})
