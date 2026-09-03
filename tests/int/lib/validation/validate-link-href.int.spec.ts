import { describe, expect, it } from "vite-plus/test"

import { HREF_MAX_LENGTH } from "@/core/lib/validation/text-limits"
import { validateLinkHref } from "@/core/lib/validation/validate-link-href"

describe("validateLinkHref", () => {
  it("内部パスとページ内リンクを受理する", () => {
    expect(validateLinkHref("/")).toBe(true)
    expect(validateLinkHref("/about")).toBe(true)
    expect(validateLinkHref("/news/2026-01-01")).toBe(true)
    expect(validateLinkHref("/contact?type=service#form")).toBe(true)
    expect(validateLinkHref("#contact")).toBe(true)
  })

  it("https の絶対 URL と mailto / tel を受理する", () => {
    expect(validateLinkHref("https://example.com")).toBe(true)
    expect(validateLinkHref("https://example.com/path?query=1#hash")).toBe(true)
    expect(validateLinkHref("mailto:info@example.com")).toBe(true)
    expect(validateLinkHref("tel:+81312345678")).toBe(true)
  })

  it("空値は任意入力として受理する", () => {
    expect(validateLinkHref("")).toBe(true)
    expect(validateLinkHref(null)).toBe(true)
    expect(validateLinkHref(undefined)).toBe(true)
  })

  it("バックスラッシュを含むパスを拒否する", () => {
    expect(validateLinkHref("/\\evil.example")).not.toBe(true)
    expect(validateLinkHref("/about\\..\\admin")).not.toBe(true)
  })

  it("実行可能スキームを拒否する", () => {
    expect(validateLinkHref("javascript:alert(1)")).not.toBe(true)
    expect(validateLinkHref("JavaScript:alert(1)")).not.toBe(true)
    expect(validateLinkHref("data:text/html,<script>alert(1)</script>")).not.toBe(true)
    expect(validateLinkHref("vbscript:msgbox(1)")).not.toBe(true)
  })

  it("プロトコル相対 URL と平文 http を拒否する", () => {
    expect(validateLinkHref("//evil.example")).not.toBe(true)
    expect(validateLinkHref("http://example.com")).not.toBe(true)
  })

  it("相対パスとホストの無い https を拒否する", () => {
    expect(validateLinkHref("about")).not.toBe(true)
    expect(validateLinkHref("../secret")).not.toBe(true)
    expect(validateLinkHref("https://")).not.toBe(true)
  })

  it("空白や改行を含む値を拒否する", () => {
    expect(validateLinkHref("/about page")).not.toBe(true)
    expect(validateLinkHref("java\nscript:alert(1)")).not.toBe(true)
    expect(validateLinkHref("https://example.com\n/evil")).not.toBe(true)
  })

  it("上限ちょうどは受理し、1 文字超過は拒否する", () => {
    const filler = "a".repeat(HREF_MAX_LENGTH - 1)

    expect(validateLinkHref(`/${filler}`)).toBe(true)
    expect(validateLinkHref(`/${filler}a`)).not.toBe(true)
  })
})
