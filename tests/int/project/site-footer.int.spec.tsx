// @vitest-environment jsdom

import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vite-plus/test"

import { exampleSiteSettings } from "@/core/test-support/example-site-settings"
import { SiteFooter } from "@/project/shared/sections/site-footer"

describe("SiteFooter", () => {
  it("CMSのサイト名・FAX・全SNSリンクを公開フッターへ反映する", () => {
    render(
      <SiteFooter
        locale="ja"
        settings={{
          ...exampleSiteSettings,
          footerText: null,
          social: {
            twitter: "https://x.com/example",
            facebook: "https://facebook.com/example",
            instagram: "https://instagram.com/example",
            youtube: "https://youtube.com/@example",
          },
        }}
      />,
    )

    expect(screen.getByText(exampleSiteSettings.siteName)).toBeTruthy()
    expect(screen.getByText(`FAX: ${exampleSiteSettings.companyInfo?.fax}`)).toBeTruthy()

    const expectedLinks = {
      "Twitter/X": "https://x.com/example",
      Facebook: "https://facebook.com/example",
      Instagram: "https://instagram.com/example",
      YouTube: "https://youtube.com/@example",
    }
    for (const [name, href] of Object.entries(expectedLinks)) {
      const link = screen.getByRole("link", { name })
      expect(link.getAttribute("href")).toBe(href)
      expect(link.getAttribute("rel")).toBe("noopener noreferrer")
    }
  })
})
