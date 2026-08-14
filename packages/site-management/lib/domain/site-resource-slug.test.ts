import { describe, expect, test } from "vite-plus/test"

import { SiteResourceSlug } from "./site-resource-slug"

describe("SiteResourceSlug", () => {
  test("accepts Payload kebab-case slugs", () => {
    const slug = SiteResourceSlug.create("site-settings")

    expect(slug).not.toBeInstanceOf(Error)
    if (slug instanceof Error) return
    expect(slug.value).toBe("site-settings")
  })

  test("rejects values that could escape the API resource path", () => {
    const slug = SiteResourceSlug.create("../users")

    expect(slug).toBeInstanceOf(Error)
  })
})
