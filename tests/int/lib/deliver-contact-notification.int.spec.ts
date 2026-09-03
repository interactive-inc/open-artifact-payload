import { getPayload, type Payload } from "payload"
import { afterEach, beforeAll, describe, expect, it, vi } from "vite-plus/test"

import { deliverContactNotification } from "@/core/lib/email/deliver-contact-notification"
import config from "@/payload.config"

let payload: Payload

const createSubmission = async () => {
  return await payload.create({
    collection: "contact-submissions",
    data: {
      name: "配信テスト",
      email: `deliver-${crypto.randomUUID()}@example.com`,
      message: "配信状態の検証",
      status: "new",
      notificationStatus: "pending",
    },
  })
}

const stubMailEnv = () => {
  vi.stubEnv("RESEND_API_KEY", "re_test_key")
  vi.stubEnv("CONTACT_NOTIFICATION_EMAIL", "admin@example.com")
  vi.stubEnv("CONTACT_NOTIFICATION_FROM", "Contact <noreply@example.com>")
}

describe("deliverContactNotification", () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it("送信に成功したら sent と通知日時を記録する", async () => {
    stubMailEnv()
    vi.spyOn(payload, "sendEmail").mockResolvedValue(undefined)
    const submission = await createSubmission()

    const delivery = await deliverContactNotification({ payload, submissionId: submission.id })

    expect(delivery).toEqual({ status: "sent" })

    const saved = await payload.findByID({
      collection: "contact-submissions",
      id: submission.id,
    })

    expect(saved.notificationStatus).toBe("sent")
    expect(saved.notifiedAt).toBeTruthy()
    expect(saved.notificationError).toBeFalsy()

    await payload.delete({ collection: "contact-submissions", id: submission.id })
  })

  it("送信に失敗したら failed と伏せ字済みの理由を記録する", async () => {
    stubMailEnv()
    vi.spyOn(payload, "sendEmail").mockRejectedValue(
      new Error("mail server refused sender@example.com"),
    )
    const submission = await createSubmission()

    const delivery = await deliverContactNotification({ payload, submissionId: submission.id })

    expect(delivery).toEqual({ status: "failed", error: "mail server refused [email]" })

    const saved = await payload.findByID({
      collection: "contact-submissions",
      id: submission.id,
    })

    expect(saved.notificationStatus).toBe("failed")
    expect(saved.notificationError).toBe("mail server refused [email]")
    expect(saved.notificationError).not.toContain("sender@example.com")
    expect(saved.notifiedAt).toBeFalsy()

    await payload.delete({ collection: "contact-submissions", id: submission.id })
  })

  it("すでに送信済みのレコードは再送しない", async () => {
    stubMailEnv()
    const sendEmail = vi.spyOn(payload, "sendEmail").mockResolvedValue(undefined)
    const submission = await createSubmission()

    await deliverContactNotification({ payload, submissionId: submission.id })
    sendEmail.mockClear()

    const delivery = await deliverContactNotification({ payload, submissionId: submission.id })

    expect(delivery).toEqual({ status: "alreadySent" })
    expect(sendEmail).not.toHaveBeenCalled()

    await payload.delete({ collection: "contact-submissions", id: submission.id })
  })

  it("メール設定が無ければ skipped を記録し送信しない", async () => {
    vi.stubEnv("RESEND_API_KEY", "")
    vi.stubEnv("CONTACT_NOTIFICATION_EMAIL", "")
    vi.stubEnv("CONTACT_NOTIFICATION_FROM", "")
    const sendEmail = vi.spyOn(payload, "sendEmail").mockResolvedValue(undefined)
    const submission = await createSubmission()

    const delivery = await deliverContactNotification({ payload, submissionId: submission.id })

    expect(delivery).toEqual({ status: "skipped", reason: "RESEND_API_KEY 未設定" })
    expect(sendEmail).not.toHaveBeenCalled()

    const saved = await payload.findByID({
      collection: "contact-submissions",
      id: submission.id,
    })

    expect(saved.notificationStatus).toBe("skipped")
    expect(saved.notificationError).toBe("RESEND_API_KEY 未設定")

    await payload.delete({ collection: "contact-submissions", id: submission.id })
  })

  it("存在しない問い合わせは Error を返す", async () => {
    stubMailEnv()
    const sendEmail = vi.spyOn(payload, "sendEmail").mockResolvedValue(undefined)

    const delivery = await deliverContactNotification({ payload, submissionId: 999999999 })

    expect(delivery).toBeInstanceOf(Error)
    expect(sendEmail).not.toHaveBeenCalled()
  })
})
