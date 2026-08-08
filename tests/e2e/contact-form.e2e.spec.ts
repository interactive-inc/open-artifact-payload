import { expect, test } from '@playwright/test'
import { getPayload } from 'payload'

import config from '../../src/payload.config.js'

const testRunID = Date.now()
const testSubmission = {
  email: `e2e-contact-${testRunID}@example.com`,
  message: `E2E テスト送信メッセージ ${testRunID}`,
  name: `E2E テスト太郎 ${testRunID}`,
} as const

test.describe('Contact form', () => {
  test.describe.configure({ timeout: 90_000 })

  test.afterAll(async () => {
    const payload = await getPayload({ config })
    await payload.delete({
      collection: 'contact-submissions',
      where: {
        and: [
          { email: { equals: testSubmission.email } },
          { message: { equals: testSubmission.message } },
          { name: { equals: testSubmission.name } },
        ],
      },
    })
  })

  test('お問い合わせフォームを送信すると thanks ページに遷移する', async ({ page }) => {
    await page.goto('http://localhost:3000/contact')

    await page.fill('input[name="name"]', testSubmission.name)
    await page.fill('input[name="email"]', testSubmission.email)
    await page.fill('textarea[name="message"]', testSubmission.message)

    // 案件側で inquiryOptions を渡すと種別 select (required) が描画されるため、
    // 存在するときだけ先頭の選択肢を選ぶ
    const inquiryTypeSelect = page.locator('select[name="inquiryType"]')
    if ((await inquiryTypeSelect.count()) > 0) {
      await inquiryTypeSelect.selectOption({ index: 1 })
    }

    await page.click('button[type="submit"]')

    await expect(page).toHaveURL(/\/contact\/thanks/, { timeout: 30_000 })
  })

  test('必須項目が空だとブラウザバリデーションで送信が止まる', async ({ page }) => {
    await page.goto('http://localhost:3000/contact')

    await page.click('button[type="submit"]')

    // HTML required で submit がブロックされる前提で、URL が変わらないことを検証
    await expect(page).toHaveURL(/\/contact$/)
  })
})
