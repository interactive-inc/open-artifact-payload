import { describe, expect, it } from "vite-plus/test"

import { sanitizeErrorMessage } from "@/core/lib/email/sanitize-error-message"

describe("sanitizeErrorMessage", () => {
  it("メールアドレスを伏せ字へ置き換える", () => {
    const sanitized = sanitizeErrorMessage(new Error("failed to send to taro@example.com"))

    expect(sanitized).toBe("failed to send to [email]")
    expect(sanitized).not.toContain("taro@example.com")
  })

  it("Error 以外の値も文字列として扱う", () => {
    expect(sanitizeErrorMessage("plain failure")).toBe("plain failure")
  })

  it("長いメッセージを 200 文字で打ち切る", () => {
    const sanitized = sanitizeErrorMessage("a".repeat(400))

    expect(sanitized).toHaveLength(201)
    expect(sanitized.endsWith("…")).toBe(true)
  })

  it("改行を含む本文が丸ごと 1 行で残らない", () => {
    const sanitized = sanitizeErrorMessage("line1\nline2\n\nline3")

    expect(sanitized).toBe("line1 line2 line3")
  })
})
