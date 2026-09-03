import { describe, expect, it } from "vite-plus/test"

import { validatePageSlug } from "@/core/lib/validation/validate-page-slug"

describe("validatePageSlug", () => {
  it("既存ルートと衝突しないスラッグを受理する", () => {
    expect(validatePageSlug("privacy-policy")).toBe(true)
    expect(validatePageSlug("company-profile")).toBe(true)
  })

  it("テンプレートの固定ルートと同じスラッグを拒否する", () => {
    expect(validatePageSlug("news")).not.toBe(true)
    expect(validatePageSlug("about")).not.toBe(true)
    expect(validatePageSlug("admin")).not.toBe(true)
    expect(validatePageSlug("api")).not.toBe(true)
  })

  it("ロケールコードと同じスラッグを拒否する", () => {
    expect(validatePageSlug("ja")).not.toBe(true)
    expect(validatePageSlug("en")).not.toBe(true)
  })

  it("形式そのものが不正なスラッグも拒否する", () => {
    expect(validatePageSlug("Privacy Policy")).not.toBe(true)
  })
})
