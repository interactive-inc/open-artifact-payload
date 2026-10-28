import { describe, expect, it } from "vite-plus/test"

import { toJstDate } from "@/core/lib/analytics/to-jst-date"

describe("toJstDate", () => {
  it("日本時間の日付を YYYY-MM-DD で返す", () => {
    expect(toJstDate(new Date("2026-10-13T03:00:00Z"))).toBe("2026-10-13")
  })

  it("UTC では前日でも日本時間で日付が変わっていれば翌日になる", () => {
    expect(toJstDate(new Date("2026-10-13T15:30:00Z"))).toBe("2026-10-14")
  })
})
