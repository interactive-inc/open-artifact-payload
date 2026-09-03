import { describe, expect, it } from "vite-plus/test"

import {
  collectConstraintViolations,
  type ConstraintRule,
} from "@/core/lib/validation/collect-constraint-violations"
import { validateLinkHref } from "@/core/lib/validation/validate-link-href"

const rules: ReadonlyArray<ConstraintRule> = [
  { path: "title", maxLength: 5, validate: null },
  { path: "hero.ctaHref", maxLength: 500, validate: validateLinkHref },
  { path: "headerNav[].href", maxLength: 500, validate: validateLinkHref },
]

describe("collectConstraintViolations", () => {
  it("制約を満たすドキュメントでは違反を返さない", () => {
    const violations = collectConstraintViolations({
      source: {
        title: "短い",
        hero: { ctaHref: "/contact" },
        headerNav: [{ href: "/about" }, { href: "https://example.com" }],
      },
      rules,
    })

    expect(violations).toEqual([])
  })

  it("文字数超過を違反として返す", () => {
    const violations = collectConstraintViolations({
      source: { title: "123456" },
      rules,
    })

    expect(violations).toHaveLength(1)
    expect(violations[0]?.field).toBe("title")
  })

  it("入れ子のフィールドと配列の添字をパスに含める", () => {
    const violations = collectConstraintViolations({
      source: {
        hero: { ctaHref: "javascript:alert(1)" },
        headerNav: [{ href: "/about" }, { href: "//evil.example" }],
      },
      rules,
    })

    expect(violations.map((violation) => violation.field)).toEqual([
      "hero.ctaHref",
      "headerNav[1].href",
    ])
  })

  it("値が無いフィールドは対象にしない", () => {
    const violations = collectConstraintViolations({
      source: { hero: null, headerNav: [] },
      rules,
    })

    expect(violations).toEqual([])
  })

  it("同じ値に文字数と形式の両方が違反しても 1 件にまとめる", () => {
    const violations = collectConstraintViolations({
      source: { hero: { ctaHref: `javascript:${"a".repeat(600)}` } },
      rules,
    })

    expect(violations).toHaveLength(1)
  })
})
