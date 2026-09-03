import { afterEach, describe, expect, it, vi } from "vite-plus/test"

import { resolveEmailAdapter } from "@/core/lib/email/resolve-email-adapter"

describe("resolveEmailAdapter", () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it("RESEND_API_KEY が無ければ undefined を返し Payload 既定へ委ねる", () => {
    vi.stubEnv("RESEND_API_KEY", "")
    vi.stubEnv("EMAIL_FROM", "Inta CMS <noreply@example.com>")

    expect(resolveEmailAdapter()).toBeUndefined()
  })

  it("送信元が無ければ undefined を返す", () => {
    vi.stubEnv("RESEND_API_KEY", "re_test_key")
    vi.stubEnv("EMAIL_FROM", "")
    vi.stubEnv("CONTACT_NOTIFICATION_FROM", "")

    expect(resolveEmailAdapter()).toBeUndefined()
  })

  it("EMAIL_FROM が揃えば Resend アダプタを返す", () => {
    vi.stubEnv("RESEND_API_KEY", "re_test_key")
    vi.stubEnv("EMAIL_FROM", "Inta CMS <noreply@example.com>")

    const adapter = resolveEmailAdapter()

    expect(adapter).toBeTypeOf("function")
  })

  it("EMAIL_FROM が無ければ CONTACT_NOTIFICATION_FROM を送信元にする", () => {
    vi.stubEnv("RESEND_API_KEY", "re_test_key")
    vi.stubEnv("EMAIL_FROM", "")
    vi.stubEnv("CONTACT_NOTIFICATION_FROM", "Contact <contact@example.com>")

    const adapter = resolveEmailAdapter()

    expect(adapter).toBeTypeOf("function")
  })

  it("送信元の形式が不正なら undefined を返す", () => {
    vi.stubEnv("RESEND_API_KEY", "re_test_key")
    vi.stubEnv("EMAIL_FROM", "not-an-address")
    vi.stubEnv("CONTACT_NOTIFICATION_FROM", "")

    const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => undefined)

    try {
      expect(resolveEmailAdapter()).toBeUndefined()
      expect(consoleWarn).toHaveBeenCalledOnce()
    } finally {
      consoleWarn.mockRestore()
    }
  })
})
