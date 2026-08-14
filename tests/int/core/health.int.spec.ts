import { getPayload, type Payload } from "payload"
import { beforeAll, describe, expect, it } from "vite-plus/test"

import config from "@/payload.config"

let payload: Payload

describe("health smoke", () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  it("users, media, news, faq, contact-submissions, site-settings, home-page が登録されている", () => {
    const slugs = payload.config.collections.map((collection) => collection.slug)
    expect(slugs).toContain("users")
    expect(slugs).toContain("media")
    expect(slugs).toContain("news")
    expect(slugs).toContain("faq")
    expect(slugs).toContain("contact-submissions")
    const globals = payload.config.globals?.map((global) => global.slug) ?? []
    expect(globals).toContain("site-settings")
    expect(globals).toContain("home-page")
  })
})
