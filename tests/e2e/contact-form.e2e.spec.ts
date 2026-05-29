import { expect, test } from '@playwright/test'

test.describe('Contact form', () => {
  test('お問い合わせフォームを送信すると thanks ページに遷移する', async ({ page }) => {
    await page.goto('http://localhost:3000/contact')

    await page.fill('input[name="name"]', 'テスト太郎')
    await page.fill('input[name="email"]', 'taro@example.com')
    await page.fill('textarea[name="message"]', 'E2E テスト送信メッセージ')

    await page.click('button[type="submit"]')

    await expect(page).toHaveURL(/\/contact\/thanks/)
  })

  test('必須項目が空だとブラウザバリデーションで送信が止まる', async ({ page }) => {
    await page.goto('http://localhost:3000/contact')

    await page.click('button[type="submit"]')

    // HTML required で submit がブロックされる前提で、URL が変わらないことを検証
    await expect(page).toHaveURL(/\/contact$/)
  })
})
