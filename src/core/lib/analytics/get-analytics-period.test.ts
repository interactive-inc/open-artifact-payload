import { describe, expect, it } from "vite-plus/test"

import { getAnalyticsPeriod } from "@/core/lib/analytics/get-analytics-period"

describe("getAnalyticsPeriod", () => {
  it("終わりは日本時間の昨日で、前の期間は直前の同じ長さ", () => {
    const period = getAnalyticsPeriod({ range: "7d", now: new Date("2026-10-14T03:00:00Z") })

    expect(period).toEqual({
      days: 7,
      current: { startDate: "2026-10-07", endDate: "2026-10-13" },
      previous: { startDate: "2026-09-30", endDate: "2026-10-06" },
    })
  })

  it("日本時間の0時30分なら、UTCの日付ではなく日本時間の昨日で終わる", () => {
    const period = getAnalyticsPeriod({ range: "7d", now: new Date("2026-10-13T15:30:00Z") })

    expect(period.current.endDate).toBe("2026-10-13")
  })

  it("28日と90日は月をまたいで数える", () => {
    const now = new Date("2026-03-01T03:00:00Z")

    expect(getAnalyticsPeriod({ range: "28d", now }).current).toEqual({
      startDate: "2026-02-01",
      endDate: "2026-02-28",
    })
    expect(getAnalyticsPeriod({ range: "90d", now }).previous).toEqual({
      startDate: "2025-09-02",
      endDate: "2025-11-30",
    })
  })
})
