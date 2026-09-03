import { describe, expect, it } from "vite-plus/test"

import { SLUG_MAX_LENGTH } from "@/core/lib/validation/text-limits"
import { validateSlug } from "@/core/lib/validation/validate-slug"

describe("validateSlug", () => {
  it("半角小文字英数字とハイフンのスラッグを受理する", () => {
    expect(validateSlug("news-2026-01")).toBe(true)
    expect(validateSlug("about")).toBe(true)
    expect(validateSlug("a1")).toBe(true)
  })

  it("空値は required 側に委ねて受理する", () => {
    expect(validateSlug("")).toBe(true)
    expect(validateSlug(null)).toBe(true)
    expect(validateSlug(undefined)).toBe(true)
  })

  it("大文字・空白・記号・日本語を拒否する", () => {
    expect(validateSlug("Bad Slug!")).not.toBe(true)
    expect(validateSlug("News")).not.toBe(true)
    expect(validateSlug("お知らせ")).not.toBe(true)
    expect(validateSlug("news/2026")).not.toBe(true)
    expect(validateSlug("news.html")).not.toBe(true)
  })

  it("ハイフンの位置と連続を拒否する", () => {
    expect(validateSlug("-news")).not.toBe(true)
    expect(validateSlug("news-")).not.toBe(true)
    expect(validateSlug("news--2026")).not.toBe(true)
  })

  it("改行を含む値を拒否する", () => {
    expect(validateSlug("news\nabout")).not.toBe(true)
  })

  it("上限ちょうどは受理し、1 文字超過は拒否する", () => {
    expect(validateSlug("a".repeat(SLUG_MAX_LENGTH))).toBe(true)
    expect(validateSlug("a".repeat(SLUG_MAX_LENGTH + 1))).not.toBe(true)
  })
})
