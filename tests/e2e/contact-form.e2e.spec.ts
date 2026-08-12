import { expect, test } from "@playwright/test"

test.describe("Contact form", () => {
  test("お問い合わせフォームを送信すると thanks ページに遷移する", async ({ page }) => {
    await page.goto("http://localhost:3000/contact")

    await page.fill('input[name="name"]', "テスト太郎")
    await page.fill('input[name="email"]', "taro@example.com")
    await page.fill('textarea[name="message"]', "E2E テスト送信メッセージ")

    // 案件側で inquiryOptions を渡すと種別 select (required) が描画されるため、
    // 存在するときだけ先頭の選択肢を選ぶ
    const inquiryTypeSelect = page.locator('select[name="inquiryType"]')
    if ((await inquiryTypeSelect.count()) > 0) {
      await inquiryTypeSelect.selectOption({ index: 1 })
    }

    await page.click('button[type="submit"]')

    // 開発サーバーの初回Server Action/thanksページコンパイルを含めて待つ。
    await expect(page).toHaveURL(/\/contact\/thanks/, { timeout: 15_000 })
  })

  test("必須項目が空だとブラウザバリデーションで送信が止まる", async ({ page }) => {
    await page.goto("http://localhost:3000/contact")

    await page.click('button[type="submit"]')

    // HTML required で submit がブロックされる前提で、URL が変わらないことを検証
    await expect(page).toHaveURL(/\/contact$/)
  })
})
