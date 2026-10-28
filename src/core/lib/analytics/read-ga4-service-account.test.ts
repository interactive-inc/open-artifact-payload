import { describe, expect, it } from "vite-plus/test"

import { AnalyticsError } from "@/core/lib/analytics/analytics-error"
import { readGa4ServiceAccount } from "@/core/lib/analytics/read-ga4-service-account"
import { createTestServiceAccount } from "@/core/test-support/create-test-service-account"

describe("readGa4ServiceAccount", () => {
  it("サービスアカウント鍵の JSON からメールアドレス・鍵・鍵 ID を読む", async () => {
    const testAccount = await createTestServiceAccount()

    const account = readGa4ServiceAccount(testAccount.json)

    expect(account).not.toBeInstanceOf(Error)
    if (account instanceof Error) return
    expect(account.clientEmail).toBe("analytics@example-project.iam.gserviceaccount.com")
    expect(account.privateKeyId).toBe("test-key-id")
    expect(account.privateKey).toContain("BEGIN PRIVATE KEY")
  })

  it("未設定なら未接続として扱う", () => {
    const account = readGa4ServiceAccount(undefined)

    expect(account).toBeInstanceOf(AnalyticsError)
    expect(account instanceof AnalyticsError && account.kind).toBe("not-configured")
  })

  it("空白だけでも未接続として扱う", () => {
    const account = readGa4ServiceAccount("  ")

    expect(account instanceof AnalyticsError && account.kind).toBe("not-configured")
  })

  it("JSON として読めない値は鍵の形式エラーにし、値そのものはメッセージに含めない", () => {
    const account = readGa4ServiceAccount("-----BEGIN PRIVATE KEY----- secret-material")

    expect(account instanceof AnalyticsError && account.kind).toBe("invalid-credentials")
    expect(account instanceof Error && account.message).not.toContain("secret-material")
  })

  it("必要な項目が欠けた JSON は鍵の形式エラーにする", () => {
    const account = readGa4ServiceAccount(JSON.stringify({ client_email: "a@example.com" }))

    expect(account instanceof AnalyticsError && account.kind).toBe("invalid-credentials")
  })
})
