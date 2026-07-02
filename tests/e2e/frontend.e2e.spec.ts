import { test, expect } from '@playwright/test'

test.describe('Frontend', () => {
  test('can go on homepage', async ({ page }) => {
    await page.goto('http://localhost:3000')
    // タイトルは site-settings のサイト名から動的生成されるため、空でないことだけ確認する
    await expect(page).toHaveTitle(/.+/)
  })
})
