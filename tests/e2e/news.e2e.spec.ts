import { expect, test } from '@playwright/test'

test.describe('News', () => {
  test.describe.configure({ timeout: 90_000 })

  test('お知らせ一覧から記事が存在すれば詳細に遷移できる', async ({ page }) => {
    await page.goto('http://localhost:3000/news')

    const firstArticleLink = page.locator('a[href^="/news/"]').first()
    const linkCount = await firstArticleLink.count()
    test.skip(linkCount === 0, 'news 記事が 0 件のためスキップ')

    await Promise.all([
      page.waitForURL(/\/news\/.+/, { timeout: 30_000 }),
      firstArticleLink.click(),
    ])
    await expect(page.locator('h1, h2').first()).toBeVisible()
  })
})
