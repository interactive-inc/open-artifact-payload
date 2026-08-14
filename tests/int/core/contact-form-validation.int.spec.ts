import { describe, expect, it } from "vite-plus/test"

import { submitContact } from "@/core/frontend/forms/contact-form-action"
import { CONTACT_FIELD_LIMITS } from "@/core/frontend/forms/contact-form-constraints"

// バリデーション失敗時は DB アクセス前に return するため Payload は不要
const passingTurnstile = { verifyTurnstile: async () => true }

describe("submitContact のバリデーション分岐", () => {
  it("空フォームなら 3 件のエラーで validationFailed を返す", async () => {
    const formData = new FormData()

    const result = await submitContact(formData, passingTurnstile)

    expect(result.status).toBe("validationFailed")
    if (result.status !== "validationFailed") return
    expect(result.errors).toHaveLength(3)
  })

  it("メールアドレスの形式が不正なら validationFailed を返す", async () => {
    const formData = new FormData()
    formData.set("name", "山田太郎")
    formData.set("email", "not-an-email")
    formData.set("message", "テスト送信")

    const result = await submitContact(formData, passingTurnstile)

    expect(result.status).toBe("validationFailed")
    if (result.status !== "validationFailed") return
    expect(result.errors.some((error) => error.includes("メールアドレス"))).toBe(true)
  })

  it("お名前が空白のみなら trim 後に空となり validationFailed を返す", async () => {
    const formData = new FormData()
    formData.set("name", "   ")
    formData.set("email", "taro@example.com")
    formData.set("message", "テスト送信")

    const result = await submitContact(formData, passingTurnstile)

    expect(result.status).toBe("validationFailed")
    if (result.status !== "validationFailed") return
    expect(result.errors.some((error) => error.includes("お名前"))).toBe(true)
  })

  it.each([
    ["name", "お名前", CONTACT_FIELD_LIMITS.name],
    ["companyName", "会社名", CONTACT_FIELD_LIMITS.companyName],
    ["email", "メールアドレス", CONTACT_FIELD_LIMITS.email],
    ["phone", "電話番号", CONTACT_FIELD_LIMITS.phone],
    ["message", "本文", CONTACT_FIELD_LIMITS.message],
    ["cf-turnstile-response", "Turnstileトークン", CONTACT_FIELD_LIMITS.turnstileToken],
  ] as const)("%s が上限を超えたら拒否する", async (field, label, maximum) => {
    const formData = new FormData()
    formData.set("name", "山田太郎")
    formData.set("email", "taro@example.com")
    formData.set("message", "テスト送信")
    formData.set(field, "a".repeat(maximum + 1))

    const result = await submitContact(formData, passingTurnstile)

    expect(result.status).toBe("validationFailed")
    if (result.status !== "validationFailed") return
    expect(result.errors.some((error) => error.includes(label))).toBe(true)
  })

  it("定義されていない問い合わせ種別を拒否する", async () => {
    const formData = new FormData()
    formData.set("name", "山田太郎")
    formData.set("email", "taro@example.com")
    formData.set("inquiryType", "untrusted-value")
    formData.set("message", "テスト送信")

    const result = await submitContact(formData, passingTurnstile)

    expect(result.status).toBe("validationFailed")
    if (result.status !== "validationFailed") return
    expect(result.errors).toContain("お問い合わせ種別の値が正しくありません")
  })

  it("文字列ではないmultipartフィールドを必須値として受け付けない", async () => {
    const formData = new FormData()
    formData.set("name", new File(["山田太郎"], "name.txt"))
    formData.set("email", "taro@example.com")
    formData.set("message", "テスト送信")

    const result = await submitContact(formData, passingTurnstile)

    expect(result.status).toBe("validationFailed")
    if (result.status !== "validationFailed") return
    expect(result.errors).toContain("お名前を入力してください")
  })
})
