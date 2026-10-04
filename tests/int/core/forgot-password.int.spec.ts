import { getPayload, type Payload } from "payload"
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vite-plus/test"

import config from "@/payload.config"

let payload: Payload
let userId: number | string
let userEmail: string

describe("forgotPassword", () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })

    userEmail = `forgot-password-${crypto.randomUUID()}@example.com`

    const created = await payload.create({
      collection: "users",
      data: {
        email: userEmail,
        password: "forgot-password-test-1234",
        roles: ["editor"],
      },
    })

    userId = created.id
  })

  // Payload 3.90 から、同じユーザーへの再設定要求は一定間隔内なら受け付けない。各テストを独立させる
  beforeEach(async () => {
    await payload.db.updateOne({
      collection: "users",
      id: userId,
      data: { resetPasswordRequestedAt: null },
    })
  })

  afterAll(async () => {
    await payload.delete({ collection: "users", id: userId })
    vi.restoreAllMocks()
  })

  it("パスワード再設定メールを再設定 URL とトークン付きで送信する", async () => {
    const sendEmail = vi.spyOn(payload.email, "sendEmail").mockResolvedValue(undefined)

    try {
      const token = await payload.forgotPassword({
        collection: "users",
        data: { email: userEmail },
      })

      expect(sendEmail).toHaveBeenCalledTimes(1)

      const message = sendEmail.mock.calls[0][0]

      expect(message.to).toBe(userEmail)
      expect(String(message.subject).length).toBeGreaterThan(0)

      const bodyText = `${String(message.html ?? "")}${String(message.text ?? "")}`

      expect(bodyText).toContain("/admin/reset/")
      expect(bodyText).toContain(token)
    } finally {
      sendEmail.mockRestore()
    }
  })

  it("再設定トークンをログへ出力しない", async () => {
    const loggedLines: string[] = []
    const record = (...args: unknown[]) => {
      loggedLines.push(args.map((arg) => JSON.stringify(arg) ?? String(arg)).join(" "))
    }

    const sendEmail = vi.spyOn(payload.email, "sendEmail").mockResolvedValue(undefined)
    const consoleLog = vi.spyOn(console, "log").mockImplementation(record)
    const consoleInfo = vi.spyOn(console, "info").mockImplementation(record)
    const consoleError = vi.spyOn(console, "error").mockImplementation(record)
    const loggerInfo = vi.spyOn(payload.logger, "info").mockImplementation(record)
    const loggerError = vi.spyOn(payload.logger, "error").mockImplementation(record)

    try {
      const token = await payload.forgotPassword({
        collection: "users",
        data: { email: userEmail },
      })

      expect(token.length).toBeGreaterThan(0)

      for (const line of loggedLines) {
        expect(line).not.toContain(token)
      }
    } finally {
      sendEmail.mockRestore()
      consoleLog.mockRestore()
      consoleInfo.mockRestore()
      consoleError.mockRestore()
      loggerInfo.mockRestore()
      loggerError.mockRestore()
    }
  })

  it("間隔内の再要求ではメールもトークンも出さない", async () => {
    const sendEmail = vi.spyOn(payload.email, "sendEmail").mockResolvedValue(undefined)

    try {
      const first = await payload.forgotPassword({
        collection: "users",
        data: { email: userEmail },
      })
      const second = await payload.forgotPassword({
        collection: "users",
        data: { email: userEmail },
      })

      expect(first.length).toBeGreaterThan(0)
      expect(second).toBeNull()
      expect(sendEmail).toHaveBeenCalledTimes(1)
    } finally {
      sendEmail.mockRestore()
    }
  })
})
