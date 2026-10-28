import { describe, expect, it } from "vite-plus/test"

import { formatChangeRate } from "@/core/lib/analytics/format-change-rate"

describe("formatChangeRate", () => {
  it("増減を記号付きで表す", () => {
    expect(formatChangeRate(12)).toBe("▲12%")
    expect(formatChangeRate(-3)).toBe("▼3%")
    expect(formatChangeRate(0)).toBe("±0%")
  })

  it("比べられないときはダッシュ", () => {
    expect(formatChangeRate(null)).toBe("—")
  })
})
