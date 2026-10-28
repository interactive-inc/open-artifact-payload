import { describe, expect, it } from "vite-plus/test"

import { parseAnalyticsRange } from "@/core/lib/analytics/parse-analytics-range"

describe("parseAnalyticsRange", () => {
  it("対応する期間はそのまま返す", () => {
    expect(parseAnalyticsRange("7d")).toBe("7d")
    expect(parseAnalyticsRange("28d")).toBe("28d")
    expect(parseAnalyticsRange("90d")).toBe("90d")
  })

  it("未指定や不正な値は28日として扱う", () => {
    expect(parseAnalyticsRange(undefined)).toBe("28d")
    expect(parseAnalyticsRange("365d")).toBe("28d")
    expect(parseAnalyticsRange(["7d", "90d"])).toBe("28d")
  })
})
