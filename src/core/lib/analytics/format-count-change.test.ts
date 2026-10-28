import { describe, expect, it } from "vite-plus/test"

import { formatCountChange } from "@/core/lib/analytics/format-count-change"

describe("formatCountChange", () => {
  it("件数の差を記号付きで表す", () => {
    expect(formatCountChange({ current: 9, previous: 7 })).toBe("▲2件")
    expect(formatCountChange({ current: 3, previous: 5 })).toBe("▼2件")
    expect(formatCountChange({ current: 4, previous: 4 })).toBe("±0件")
  })
})
