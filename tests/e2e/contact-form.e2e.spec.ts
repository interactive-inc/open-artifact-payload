import { expect, test, type APIRequestContext } from "@playwright/test"

import { previewUser } from "../helpers/seed-user"

// Turnstile は Cloudflare 公開のテストキー（常に成功）で本番と同じ経路を通す。
// ウィジェットの読み込みと siteverify で challenges.cloudflare.com へ接続するため、
// ネットワークが無い環境ではこのファイルの送信テストは通らない。
const testRunID = `${Date.now()}-${process.pid}`
const testSubmission = {
  email: `e2e-contact-${testRunID}@example.com`,
  message: `E2E テスト送信メッセージ ${testRunID}`,
  name: `E2E テスト太郎 ${testRunID}`,
} as const

async function countSavedSubmissions(request: APIRequestContext): Promise<number> {
  const loginResponse = await request.post("http://localhost:3000/api/users/login", {
    data: previewUser,
  })
  if (!loginResponse.ok()) {
    throw new Error(`Failed to authenticate contact E2E reader: ${loginResponse.status()}`)
  }

  const url = new URL("http://localhost:3000/api/contact-submissions")
  url.searchParams.set("where[email][equals]", testSubmission.email)
  url.searchParams.set("limit", "20")
  const findResponse = await request.get(url.toString())
  if (!findResponse.ok()) {
    throw new Error(`Failed to find contact E2E submission: ${findResponse.status()}`)
  }

  const body: unknown = await findResponse.json()
  if (body === null || typeof body !== "object" || !("docs" in body)) return 0
  if (!Array.isArray(body.docs)) return 0

  return body.docs.length
}

test.describe("Contact form", () => {
  test("Turnstile トークン付きで送信すると thanks ページに遷移し保存される", async ({ page }) => {
    await page.goto("http://localhost:3000/contact")

    // ウィジェット本体の iframe は Turnstile が閉じた shadow root に描画するため参照できない。
    // 代わりに light DOM のコンテナと、ウィジェットが解決したときだけ値が入る hidden input を見る。
    await expect(page.locator("div.cf-turnstile")).toBeVisible({ timeout: 60_000 })

    const turnstileToken = page.locator('input[name="cf-turnstile-response"]')
    await expect(turnstileToken).toHaveValue(/.+/, { timeout: 60_000 })

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

    // 初回はServer ActionとローカルD1の起動を含むため、既定の5秒では不足する。
    await expect(page).toHaveURL(/\/contact\/thanks/, { timeout: 30_000 })

    expect(await countSavedSubmissions(page.request)).toBe(1)
  })

  test("必須項目が空だとブラウザバリデーションで送信が止まる", async ({ page }) => {
    await page.goto("http://localhost:3000/contact")

    await page.click('button[type="submit"]')

    // HTML required で submit がブロックされる前提で、URL が変わらないことを検証
    await expect(page).toHaveURL(/\/contact$/)
  })
})
