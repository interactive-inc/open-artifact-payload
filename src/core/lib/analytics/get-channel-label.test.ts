import { describe, expect, it } from "vite-plus/test"

import { getChannelLabel } from "@/core/lib/analytics/get-channel-label"

describe("getChannelLabel", () => {
  it("GA4 の標準の分類を日本語にする", () => {
    expect(getChannelLabel("Organic Search")).toBe("自然検索")
    expect(getChannelLabel("Direct")).toBe("直接")
    expect(getChannelLabel("Organic Social")).toBe("SNS")
    expect(getChannelLabel("Referral")).toBe("他サイトからのリンク")
  })

  it("知らない分類は GA4 の名前のまま出す", () => {
    expect(getChannelLabel("Audio")).toBe("Audio")
  })
})
