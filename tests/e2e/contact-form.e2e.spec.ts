import { expect, test, type APIRequestContext } from "@playwright/test"

import { previewUser } from "../helpers/seed-user"

const testRunID = `${Date.now()}-${process.pid}`
const testSubmission = {
  email: `e2e-contact-${testRunID}@example.com`,
  message: `E2E テスト送信メッセージ ${testRunID}`,
  name: `E2E テスト太郎 ${testRunID}`,
} as const

async function cleanupTestSubmission(request: APIRequestContext): Promise<void> {
  const loginResponse = await request.post("http://localhost:3000/api/users/login", {
    data: previewUser,
  })
  if (!loginResponse.ok()) {
    throw new Error(`Failed to authenticate contact E2E cleanup: ${loginResponse.status()}`)
  }

  const url = new URL("http://localhost:3000/api/contact-submissions")
  url.searchParams.set("where[email][equals]", testSubmission.email)
  url.searchParams.set("limit", "20")
  const findResponse = await request.get(url.toString())
  if (!findResponse.ok()) {
    throw new Error(`Failed to find contact E2E submission: ${findResponse.status()}`)
  }

  const body: unknown = await findResponse.json()
  const docs =
    body !== null && typeof body === "object" && "docs" in body && Array.isArray(body.docs)
      ? body.docs
      : []
  for (const doc of docs) {
    const id =
      doc !== null &&
      typeof doc === "object" &&
      "id" in doc &&
      (typeof doc.id === "string" || typeof doc.id === "number")
        ? doc.id
        : undefined
    if (id === undefined) continue
    const deleteResponse = await request.delete(
      `http://localhost:3000/api/contact-submissions/${encodeURIComponent(String(id))}`,
    )
    if (!deleteResponse.ok()) {
      throw new Error(`Failed to clean up contact E2E submission ${id}: ${deleteResponse.status()}`)
    }
  }
}

test.describe("Contact form", () => {
  test("お問い合わせフォームを送信すると thanks ページに遷移する", async ({ page }) => {
    try {
      await page.goto("http://localhost:3000/contact")

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
    } finally {
      await cleanupTestSubmission(page.request)
    }
  })

  test("必須項目が空だとブラウザバリデーションで送信が止まる", async ({ page }) => {
    await page.goto("http://localhost:3000/contact")

    await page.click('button[type="submit"]')

    // HTML required で submit がブロックされる前提で、URL が変わらないことを検証
    await expect(page).toHaveURL(/\/contact$/)
  })
})
