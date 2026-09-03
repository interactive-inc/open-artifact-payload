import { getPayload, type Payload } from "payload"
import { afterEach, beforeAll, describe, expect, it, vi } from "vite-plus/test"

import { sendContactNotification } from "@/core/lib/email/send-contact-notification"
import config from "@/payload.config"

let payload: Payload

const submission = {
  name: "山田太郎",
  email: "taro@example.com",
  phone: "03-0000-0000",
  companyName: "インタ株式会社",
  inquiryType: "service",
  message: "サービスについて問い合わせます",
}

describe("sendContactNotification", () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it("RESEND_API_KEY が未設定なら送信せず skipped を返す", async () => {
    vi.stubEnv("RESEND_API_KEY", "")
    vi.stubEnv("CONTACT_NOTIFICATION_EMAIL", "admin@example.com")
    vi.stubEnv("CONTACT_NOTIFICATION_FROM", "Contact <noreply@example.com>")
    const sendEmail = vi.spyOn(payload, "sendEmail")

    const result = await sendContactNotification({ payload, submission })

    expect(result.status).toBe("skipped")
    expect(sendEmail).not.toHaveBeenCalled()
  })

  it("CONTACT_NOTIFICATION_EMAIL が未設定なら送信せず skipped を返す", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_test_key")
    vi.stubEnv("CONTACT_NOTIFICATION_EMAIL", "")
    vi.stubEnv("CONTACT_NOTIFICATION_FROM", "Contact <noreply@example.com>")
    const sendEmail = vi.spyOn(payload, "sendEmail")

    const result = await sendContactNotification({ payload, submission })

    expect(result.status).toBe("skipped")
    expect(sendEmail).not.toHaveBeenCalled()
  })

  it("送信元は CONTACT_NOTIFICATION_FROM が無ければ EMAIL_FROM を使う", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_test_key")
    vi.stubEnv("CONTACT_NOTIFICATION_EMAIL", "admin@example.com")
    vi.stubEnv("CONTACT_NOTIFICATION_FROM", "")
    vi.stubEnv("EMAIL_FROM", "Inta CMS <system@example.com>")
    const sendEmail = vi.spyOn(payload, "sendEmail").mockResolvedValue(undefined)

    const result = await sendContactNotification({ payload, submission })

    expect(result.status).toBe("sent")
    expect(sendEmail.mock.calls[0][0].from).toBe("Inta CMS <system@example.com>")
  })

  it("環境変数が揃い送信が成功すれば sent を返し宛先と返信先を渡す", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_test_key")
    vi.stubEnv("CONTACT_NOTIFICATION_EMAIL", "admin@example.com")
    vi.stubEnv("CONTACT_NOTIFICATION_FROM", "Contact <noreply@example.com>")
    const sendEmail = vi.spyOn(payload, "sendEmail").mockResolvedValue(undefined)

    const result = await sendContactNotification({ payload, submission })

    expect(result.status).toBe("sent")
    expect(sendEmail).toHaveBeenCalledTimes(1)

    const sentArgs = sendEmail.mock.calls[0][0]

    expect(sentArgs.from).toBe("Contact <noreply@example.com>")
    expect(sentArgs.to).toBe("admin@example.com")
    expect(sentArgs.replyTo).toBe("taro@example.com")
    expect(String(sentArgs.subject)).toContain("山田太郎")
    expect(String(sentArgs.text)).toContain("サービスについて問い合わせます")
  })

  it("送信が拒否されたら例外を投げず failed を伏せ字済みのエラーで返す", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_test_key")
    vi.stubEnv("CONTACT_NOTIFICATION_EMAIL", "admin@example.com")
    vi.stubEnv("CONTACT_NOTIFICATION_FROM", "Contact <noreply@example.com>")
    const sendEmail = vi
      .spyOn(payload, "sendEmail")
      .mockRejectedValue(new Error("Resend API error for taro@example.com"))

    const result = await sendContactNotification({ payload, submission })

    expect(result.status).toBe("failed")

    if (result.status === "failed") {
      expect(result.error).toBe("Resend API error for [email]")
      expect(result.error).not.toContain("taro@example.com")
    }

    expect(sendEmail).toHaveBeenCalledTimes(1)
  })
})
