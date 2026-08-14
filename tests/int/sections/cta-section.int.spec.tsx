/**
 * @vitest-environment jsdom
 */
import { render } from "@testing-library/react"
import React from "react"
import { describe, expect, it } from "vite-plus/test"

import { CtaSection } from "@/core/sections/cta-section"

describe("CtaSection", () => {
  it("enabled=false のとき何も描画しない", () => {
    const { container } = render(
      <CtaSection
        data={{
          enabled: false,
          heading: "お問い合わせ",
          description: "お気軽にどうぞ",
          ctaLabel: "連絡する",
          ctaHref: "/contact",
        }}
      />,
    )
    expect(container.firstChild).toBeNull()
  })

  it("enabled=true のとき見出しと ctaHref を持つリンクを描画する", () => {
    const { getByRole } = render(
      <CtaSection
        data={{
          enabled: true,
          heading: "お問い合わせ",
          description: "お気軽にどうぞ",
          ctaLabel: "連絡する",
          ctaHref: "/contact",
        }}
      />,
    )
    expect(getByRole("heading", { level: 2 }).textContent).toBe("お問い合わせ")
    const link = getByRole("link", { name: "連絡する" })
    expect(link.getAttribute("href")).toBe("/contact")
  })

  it("ctaLabel / ctaHref が無いときリンクを描画しない", () => {
    const { queryByRole, getByRole } = render(
      <CtaSection
        data={{
          enabled: true,
          heading: "お問い合わせ",
          description: "お気軽にどうぞ",
          ctaLabel: null,
          ctaHref: null,
        }}
      />,
    )
    expect(getByRole("heading", { level: 2 }).textContent).toBe("お問い合わせ")
    expect(queryByRole("link")).toBeNull()
  })
})
