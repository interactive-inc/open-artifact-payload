import { expect, test } from '@playwright/test'

test.describe('News', () => {
  test('お知らせ一覧から記事が存在すれば詳細に遷移できる', async ({ page }) => {
    await page.goto('http://localhost:3000/news')

    const firstArticleLink = page.locator('a[href^="/news/"]').first()
    const linkCount = await firstArticleLink.count()
    test.skip(linkCount === 0, 'news 記事が 0 件のためスキップ')

    await firstArticleLink.click()
    await expect(page).toHaveURL(/\/news\/.+/)
    await expect(page.locator('h1, h2').first()).toBeVisible()
  })
})
