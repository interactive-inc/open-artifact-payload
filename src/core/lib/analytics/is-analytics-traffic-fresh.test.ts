import { describe, expect, it } from "vite-plus/test"

import { getAnalyticsPeriod } from "@/core/lib/analytics/get-analytics-period"
import { isAnalyticsTrafficFresh } from "@/core/lib/analytics/is-analytics-traffic-fresh"

const cachedAt = (fetchedAt: string) => ({
  fetchedAt,
  range: "28d" as const,
  period: getAnalyticsPeriod({ range: "28d", now: new Date(fetchedAt) }),
})

describe("isAnalyticsTrafficFresh", () => {
  it("取得から3時間以内なら使い回す", () => {
    expect(
      isAnalyticsTrafficFresh({
        traffic: cachedAt("2026-10-14T01:00:00.000Z"),
        now: new Date("2026-10-14T03:59:00Z"),
      }),
    ).toBe(true)
  })

  it("3時間を過ぎたら取得し直す", () => {
    expect(
      isAnalyticsTrafficFresh({
        traffic: cachedAt("2026-10-14T01:00:00.000Z"),
        now: new Date("2026-10-14T04:01:00Z"),
      }),
    ).toBe(false)
  })

  it("3時間以内でも日本時間の日付が変わって期間がずれたら取得し直す", () => {
    expect(
      isAnalyticsTrafficFresh({
        traffic: cachedAt("2026-10-14T14:30:00.000Z"),
        now: new Date("2026-10-14T15:10:00Z"),
      }),
    ).toBe(false)
  })

  it("未来の取得時刻は信用しない", () => {
    expect(
      isAnalyticsTrafficFresh({
        traffic: cachedAt("2026-10-14T05:00:00.000Z"),
        now: new Date("2026-10-14T01:00:00Z"),
      }),
    ).toBe(false)
  })
})
