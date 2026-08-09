import { getPayload, type Payload } from "payload"
import { beforeAll, describe, expect, it } from "vite-plus/test"

import config from "@/payload.config"

let payload: Payload

describe("core globals", () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  it("site-settings を更新できる", async () => {
    const updated = await payload.updateGlobal({
      slug: "site-settings",
      data: {
        siteName: "テストサイト",
      },
    })

    expect(updated.siteName).toBe("テストサイト")
  })
})
