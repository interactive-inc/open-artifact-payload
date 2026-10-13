import { describe, expect, it } from "vite-plus/test"

import { formatShortDate } from "@/core/lib/analytics/format-short-date"

describe("formatShortDate", () => {
  it("YYYY-MM-DD を月/日にする", () => {
    expect(formatShortDate("2026-10-07")).toBe("10/7")
    expect(formatShortDate("2026-01-31")).toBe("1/31")
  })
})
