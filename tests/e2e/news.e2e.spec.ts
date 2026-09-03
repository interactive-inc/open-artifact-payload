import { expect, test } from "@playwright/test"

import { e2eFixtures } from "../helpers/e2e-fixtures"

test.describe("News", () => {
  test("お知らせ一覧から公開記事の詳細へ遷移できる", async ({ page }) => {
    await page.goto("http://localhost:3000/news")

    const articleLink = page.locator(`a[href="/news/${e2eFixtures.publishedNews.slug}"]`)
    await expect(articleLink).toBeVisible()

    await articleLink.click()
    await expect(page).toHaveURL(`http://localhost:3000/news/${e2eFixtures.publishedNews.slug}`, {
      timeout: 30_000,
    })
    await expect(
      page.getByRole("heading", { level: 1, name: e2eFixtures.publishedNews.title, exact: true }),
    ).toBeVisible()
  })

  test("カテゴリ違いの公開記事も一覧に並ぶ", async ({ page }) => {
    await page.goto("http://localhost:3000/news")

    await expect(page.getByText(e2eFixtures.publishedNews.title, { exact: true })).toBeVisible()
    await expect(
      page.getByText(e2eFixtures.publishedPressNews.title, { exact: true }),
    ).toBeVisible()
  })

  test("下書き記事は一覧にも詳細にも出ない", async ({ page }) => {
    await page.goto("http://localhost:3000/news")
    await expect(page.getByText(e2eFixtures.draftNews.title, { exact: true })).toHaveCount(0)
    await expect(page.locator(`a[href="/news/${e2eFixtures.draftNews.slug}"]`)).toHaveCount(0)

    const response = await page.goto(`http://localhost:3000/news/${e2eFixtures.draftNews.slug}`)
    expect(response?.status()).toBe(404)
  })
})
