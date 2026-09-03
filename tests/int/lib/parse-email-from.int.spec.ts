import { describe, expect, it } from "vite-plus/test"

import { parseEmailFrom } from "@/core/lib/email/parse-email-from"

describe("parseEmailFrom", () => {
  it("表示名付きの送信元を表示名とアドレスへ分解する", () => {
    const parsed = parseEmailFrom("Inta CMS <noreply@example.com>")

    expect(parsed).toEqual({ address: "noreply@example.com", name: "Inta CMS" })
  })

  it("表示名がクォートされていても外して扱う", () => {
    const parsed = parseEmailFrom('"Inta CMS" <noreply@example.com>')

    expect(parsed).toEqual({ address: "noreply@example.com", name: "Inta CMS" })
  })

  it("アドレスだけの指定はローカル部を表示名にする", () => {
    const parsed = parseEmailFrom("noreply@example.com")

    expect(parsed).toEqual({ address: "noreply@example.com", name: "noreply" })
  })

  it("空文字は Error を返す", () => {
    const parsed = parseEmailFrom("   ")

    expect(parsed).toBeInstanceOf(Error)
  })

  it("アドレスとして成立しない値は Error を返す", () => {
    const parsed = parseEmailFrom("Inta CMS <not an address>")

    expect(parsed).toBeInstanceOf(Error)
  })
})
