import { getPayload, type Payload } from "payload"
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vite-plus/test"

import { handleResendNotification } from "@/core/lib/email/handle-resend-notification"
import config from "@/payload.config"

let payload: Payload

const adminUser = { id: 1, email: "admin@example.com", roles: ["admin"] }
const editorUser = { id: 2, email: "editor@example.com", roles: ["editor"] }

const createSubmission = async () => {
  return await payload.create({
    collection: "contact-submissions",
    data: {
      name: "再送テスト",
      email: `resend-${crypto.randomUUID()}@example.com`,
      message: "再送の検証",
      status: "new",
      notificationStatus: "failed",
    },
  })
}

describe("handleResendNotification", () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })

    vi.stubEnv("RESEND_API_KEY", "re_test_key")
    vi.stubEnv("CONTACT_NOTIFICATION_EMAIL", "admin@example.com")
    vi.stubEnv("CONTACT_NOTIFICATION_FROM", "Contact <noreply@example.com>")
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  afterAll(() => {
    vi.unstubAllEnvs()
  })

  it("未ログインは 401 を返す", async () => {
    const response = await handleResendNotification({ payload, user: null, submissionId: 1 })

    expect(response.status).toBe(401)
  })

  it("editor は 403 で再送できない", async () => {
    const sendEmail = vi.spyOn(payload, "sendEmail").mockResolvedValue(undefined)

    const response = await handleResendNotification({
      payload,
      user: editorUser,
      submissionId: 1,
    })

    expect(response.status).toBe(403)
    expect(sendEmail).not.toHaveBeenCalled()
  })

  it("対象が無ければ 404 を返す", async () => {
    vi.spyOn(payload, "sendEmail").mockResolvedValue(undefined)

    const response = await handleResendNotification({
      payload,
      user: adminUser,
      submissionId: 999999999,
    })

    expect(response.status).toBe(404)
  })

  it("admin が失敗レコードを再送すると sent を返す", async () => {
    const sendEmail = vi.spyOn(payload, "sendEmail").mockResolvedValue(undefined)
    const submission = await createSubmission()

    const response = await handleResendNotification({
      payload,
      user: adminUser,
      submissionId: submission.id,
    })

    expect(response.status).toBe(200)
    expect(response.body.notificationStatus).toBe("sent")
    expect(sendEmail).toHaveBeenCalledTimes(1)

    await payload.delete({ collection: "contact-submissions", id: submission.id })
  })

  it("送信済みのレコードは alreadySent を返し再送しない", async () => {
    const sendEmail = vi.spyOn(payload, "sendEmail").mockResolvedValue(undefined)
    const submission = await payload.create({
      collection: "contact-submissions",
      data: {
        name: "送信済み",
        email: `already-${crypto.randomUUID()}@example.com`,
        message: "送信済みの検証",
        status: "new",
        notificationStatus: "sent",
      },
    })

    const response = await handleResendNotification({
      payload,
      user: adminUser,
      submissionId: submission.id,
    })

    expect(response.status).toBe(200)
    expect(response.body.notificationStatus).toBe("alreadySent")
    expect(sendEmail).not.toHaveBeenCalled()

    await payload.delete({ collection: "contact-submissions", id: submission.id })
  })
})
