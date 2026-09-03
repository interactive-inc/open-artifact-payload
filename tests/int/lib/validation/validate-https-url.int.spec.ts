import { describe, expect, it } from "vite-plus/test"

import { validateHttpsUrl } from "@/core/lib/validation/validate-https-url"

describe("validateHttpsUrl", () => {
  it("https の絶対 URL を受理する", () => {
    expect(validateHttpsUrl("https://example.com")).toBe(true)
    expect(validateHttpsUrl("https://x.com/inta_inc")).toBe(true)
  })

  it("空値は任意入力として受理する", () => {
    expect(validateHttpsUrl("")).toBe(true)
    expect(validateHttpsUrl(null)).toBe(true)
    expect(validateHttpsUrl(undefined)).toBe(true)
  })

  it("http・内部パス・実行可能スキームを拒否する", () => {
    expect(validateHttpsUrl("http://example.com")).not.toBe(true)
    expect(validateHttpsUrl("/about")).not.toBe(true)
    expect(validateHttpsUrl("javascript:alert(1)")).not.toBe(true)
    expect(validateHttpsUrl("//evil.example")).not.toBe(true)
  })

  it("ホストの無い URL と空白入りの URL を拒否する", () => {
    expect(validateHttpsUrl("https://")).not.toBe(true)
    expect(validateHttpsUrl("https:// example.com")).not.toBe(true)
  })
})
