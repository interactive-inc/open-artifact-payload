import { describe, expect, it } from "vite-plus/test"

import { readLinkButton } from "@/core/lib/rich-text/read-link-button"

describe("readLinkButton", () => {
  it("サイト内のリンクは同じタブで開く", () => {
    expect(readLinkButton({ label: "お問い合わせ", href: "/contact/", size: "standard" })).toEqual({
      label: "お問い合わせ",
      href: "/contact/",
      size: "standard",
      isExternal: false,
    })
  })

  it("https:// のリンクは外部リンクにする", () => {
    expect(readLinkButton({ label: "外部", href: "https://example.com/", size: "small" })).toEqual({
      label: "外部",
      href: "https://example.com/",
      size: "small",
      isExternal: true,
    })
  })

  it("下書きで文言かリンク先が未入力なら描画しない", () => {
    expect(readLinkButton({ size: "standard" })).toBeNull()
    expect(readLinkButton({ label: "お問い合わせ", href: "" })).toBeNull()
    expect(readLinkButton({ label: "  ", href: "/contact/" })).toBeNull()
  })

  it("保存時の検証を通っていないリンク先は描画しない", () => {
    expect(readLinkButton({ label: "危険", href: "javascript:alert(1)" })).toBeNull()
    expect(readLinkButton({ label: "書きかけ", href: "https:/" })).toBeNull()
  })

  it("大きさが未設定なら標準にする", () => {
    expect(readLinkButton({ label: "お問い合わせ", href: "/contact/" })?.size).toBe("standard")
  })
})
