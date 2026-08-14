import { getPayload, type Payload } from "payload"
import { beforeAll, describe, expect, it, vi } from "vite-plus/test"

import config from "@/payload.config"
import { submitContact } from "@/core/frontend/forms/contact-form-action"

let payload: Payload

describe("submitContact", () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  it("必須フィールドが揃っていれば保存される", async () => {
    // E2E や手動確認で同じアドレスのレコードが残っていても壊れないよう、実行ごとに一意にする
    const uniqueEmail = `int-test-${Date.now()}@example.com`
    const formData = new FormData()
    formData.set("name", "山田太郎")
    formData.set("email", uniqueEmail)
    formData.set("message", "テスト送信")
    formData.set("cf-turnstile-response", "test-token")

    const verifier = vi.fn().mockResolvedValue(true)
    const rateLimiter = vi.fn().mockResolvedValue("allowed")
    const result = await submitContact(formData, {
      verifyTurnstile: verifier,
      checkRateLimit: rateLimiter,
    })
    expect(result.status).toBe("ok")

    const saved = await payload.find({
      collection: "contact-submissions",
      where: { email: { equals: uniqueEmail } },
    })
    expect(saved.docs).toHaveLength(1)
    await payload.delete({ collection: "contact-submissions", id: saved.docs[0].id })
    expect(verifier).toHaveBeenCalledWith("test-token")
    expect(rateLimiter).toHaveBeenCalledOnce()
    expect(rateLimiter).toHaveBeenCalledWith(expect.stringMatching(/^contact:[a-f\d]{64}$/))
  })

  it("Turnstile 検証に失敗したら保存しない", async () => {
    const formData = new FormData()
    formData.set("name", "NG 太郎")
    formData.set("email", "ng@example.com")
    formData.set("message", "スパム")
    formData.set("cf-turnstile-response", "bad-token")

    const verifier = vi.fn().mockResolvedValue(false)
    const result = await submitContact(formData, { verifyTurnstile: verifier })
    expect(result.status).toBe("turnstileFailed")

    const saved = await payload.find({
      collection: "contact-submissions",
      where: { email: { equals: "ng@example.com" } },
    })
    expect(saved.docs).toHaveLength(0)
  })

  it("レート上限に達したらTurnstile検証も保存も行わない", async () => {
    const uniqueEmail = `rate-limited-${crypto.randomUUID()}@example.com`
    const formData = new FormData()
    formData.set("name", "Rate Limited")
    formData.set("email", uniqueEmail)
    formData.set("message", "送信しすぎ")

    const verifier = vi.fn().mockResolvedValue(true)
    const result = await submitContact(formData, {
      verifyTurnstile: verifier,
      checkRateLimit: vi.fn().mockResolvedValue("limited"),
    })

    expect(result.status).toBe("rateLimited")
    expect(verifier).not.toHaveBeenCalled()
    const saved = await payload.find({
      collection: "contact-submissions",
      where: { email: { equals: uniqueEmail } },
    })
    expect(saved.docs).toHaveLength(0)
  })

  it("本番でTurnstileシークレットが未設定ならfail-closedにする", async () => {
    const formData = new FormData()
    formData.set("name", "Production User")
    formData.set("email", `production-${crypto.randomUUID()}@example.com`)
    formData.set("message", "設定不足では保存しない")

    vi.stubEnv("NODE_ENV", "production")
    vi.stubEnv("TURNSTILE_SECRET_KEY", "")
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined)
    try {
      const result = await submitContact(formData, {
        checkRateLimit: vi.fn().mockResolvedValue("allowed"),
      })
      expect(result.status).toBe("serverError")
      expect(consoleError).toHaveBeenCalledWith(
        "[contact] TURNSTILE_SECRET_KEY が本番環境に設定されていません",
      )
    } finally {
      consoleError.mockRestore()
      vi.unstubAllEnvs()
    }
  })
})
