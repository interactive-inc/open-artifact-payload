import { getPayload, type Payload } from "payload"
import { afterEach, beforeAll, describe, expect, it, vi } from "vite-plus/test"

import config from "@/payload.config"
import { submitContact } from "@/core/frontend/forms/contact-form-action"

let payload: Payload

describe("submitContact", () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it("必須フィールドが揃っていれば保存される", async () => {
    // E2E や手動確認で同じアドレスのレコードが残っていても壊れないよう、実行ごとに一意にする
    const uniqueEmail = `int-test-${Date.now()}@example.com`
    const formData = new FormData()
    formData.set("name", "山田太郎")
    formData.set("email", uniqueEmail)
    formData.set("message", "テスト送信")
    formData.set("status", "done")
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
    expect(saved.docs[0].status).toBe("new")
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

  it("保存に失敗しても送信者の氏名・メール・本文をログに出さない", async () => {
    const senderName = "ログ検査 太郎"
    const senderEmail = `log-check-${crypto.randomUUID()}@example.com`
    const senderMessage = "ログに出てはいけない本文"
    const formData = new FormData()
    formData.set("name", senderName)
    formData.set("email", senderEmail)
    formData.set("message", senderMessage)

    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined)
    const create = vi
      .spyOn(payload, "create")
      .mockRejectedValue(
        new Error(`D1_ERROR: failed to insert ${senderEmail} / ${senderName} / ${senderMessage}`),
      )
    try {
      const result = await submitContact(formData, {
        verifyTurnstile: vi.fn().mockResolvedValue(true),
        checkRateLimit: vi.fn().mockResolvedValue("allowed"),
      })

      expect(result.status).toBe("serverError")
      const logged = consoleError.mock.calls.map((call) => call.join(" ")).join("\n")
      expect(logged).toContain("[contact] 問い合わせ保存失敗:")
      expect(logged).not.toContain(senderEmail)
      expect(logged).not.toContain(senderName)
      expect(logged).not.toContain(senderMessage)
    } finally {
      create.mockRestore()
      consoleError.mockRestore()
    }
  })

  it("通知メールに失敗しても送信者の氏名・メール・本文をログに出さない", async () => {
    const senderName = "通知失敗 太郎"
    const senderEmail = `notify-fail-${crypto.randomUUID()}@example.com`
    const senderMessage = "通知が失敗してもログに出てはいけない本文"
    const formData = new FormData()
    formData.set("name", senderName)
    formData.set("email", senderEmail)
    formData.set("message", senderMessage)

    vi.stubEnv("RESEND_API_KEY", "re_test_key")
    vi.stubEnv("CONTACT_NOTIFICATION_EMAIL", "admin@example.com")
    vi.stubEnv("CONTACT_NOTIFICATION_FROM", "Contact <noreply@example.com>")
    const sendEmail = vi
      .spyOn(payload, "sendEmail")
      .mockRejectedValue(
        new Error(`Resend rejected ${senderEmail}: ${senderName} / ${senderMessage}`),
      )
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined)
    try {
      const result = await submitContact(formData, {
        verifyTurnstile: vi.fn().mockResolvedValue(true),
        checkRateLimit: vi.fn().mockResolvedValue("allowed"),
      })

      expect(result.status).toBe("ok")
      const logged = consoleError.mock.calls.map((call) => call.join(" ")).join("\n")
      expect(logged).toContain("[contact] 通知メール送信失敗:")
      expect(logged).not.toContain(senderEmail)
      expect(logged).not.toContain(senderName)
      expect(logged).not.toContain(senderMessage)
    } finally {
      consoleError.mockRestore()
      sendEmail.mockRestore()
      vi.unstubAllEnvs()
    }

    const saved = await payload.find({
      collection: "contact-submissions",
      where: { email: { equals: senderEmail } },
    })
    for (const doc of saved.docs) {
      await payload.delete({ collection: "contact-submissions", id: doc.id })
    }
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

  it("通知メールが失敗しても保存は成功し、レコードへ失敗を記録する", async () => {
    const uniqueEmail = `notify-failed-${crypto.randomUUID()}@example.com`
    const secretMessage = "社外秘の相談内容です"
    const formData = new FormData()
    formData.set("name", "通知失敗 太郎")
    formData.set("email", uniqueEmail)
    formData.set("message", secretMessage)
    formData.set("cf-turnstile-response", "test-token")

    vi.stubEnv("RESEND_API_KEY", "re_test_key")
    vi.stubEnv("CONTACT_NOTIFICATION_EMAIL", "admin@example.com")
    vi.stubEnv("CONTACT_NOTIFICATION_FROM", "Contact <noreply@example.com>")

    const loggedLines: string[] = []
    const sendEmail = vi
      .spyOn(payload, "sendEmail")
      .mockRejectedValue(new Error(`mail relay refused ${uniqueEmail}`))
    const consoleError = vi.spyOn(console, "error").mockImplementation((...args: unknown[]) => {
      loggedLines.push(args.map((arg) => String(arg)).join(" "))
    })

    const result = await submitContact(formData, {
      verifyTurnstile: vi.fn().mockResolvedValue(true),
      checkRateLimit: vi.fn().mockResolvedValue("allowed"),
      notificationRetryDelayMs: 0,
    })

    expect(result.status).toBe("ok")
    // 失敗時は 1 度だけ再試行する
    expect(sendEmail).toHaveBeenCalledTimes(2)

    const saved = await payload.find({
      collection: "contact-submissions",
      where: { email: { equals: uniqueEmail } },
    })

    expect(saved.docs).toHaveLength(1)
    expect(saved.docs[0].notificationStatus).toBe("failed")
    expect(saved.docs[0].notificationError).toBe("mail relay refused [email]")

    expect(consoleError).toHaveBeenCalled()

    for (const line of loggedLines) {
      expect(line).not.toContain(uniqueEmail)
      expect(line).not.toContain(secretMessage)
    }

    await payload.delete({ collection: "contact-submissions", id: saved.docs[0].id })
  })

  it("通知メールが成功したらレコードへ送信済みを記録する", async () => {
    const uniqueEmail = `notify-sent-${crypto.randomUUID()}@example.com`
    const formData = new FormData()
    formData.set("name", "通知成功 太郎")
    formData.set("email", uniqueEmail)
    formData.set("message", "通知済みの検証")
    formData.set("cf-turnstile-response", "test-token")

    vi.stubEnv("RESEND_API_KEY", "re_test_key")
    vi.stubEnv("CONTACT_NOTIFICATION_EMAIL", "admin@example.com")
    vi.stubEnv("CONTACT_NOTIFICATION_FROM", "Contact <noreply@example.com>")

    const sendEmail = vi.spyOn(payload, "sendEmail").mockResolvedValue(undefined)

    const result = await submitContact(formData, {
      verifyTurnstile: vi.fn().mockResolvedValue(true),
      checkRateLimit: vi.fn().mockResolvedValue("allowed"),
    })

    expect(result.status).toBe("ok")
    expect(sendEmail).toHaveBeenCalledTimes(1)

    const saved = await payload.find({
      collection: "contact-submissions",
      where: { email: { equals: uniqueEmail } },
    })

    expect(saved.docs[0].notificationStatus).toBe("sent")
    expect(saved.docs[0].notifiedAt).toBeTruthy()

    await payload.delete({ collection: "contact-submissions", id: saved.docs[0].id })
  })
})
