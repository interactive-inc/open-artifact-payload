import { describe, expect, it } from "vite-plus/test"

import { ga4BatchResponseSchema } from "@/core/lib/analytics/ga4-batch-response-schema"
import { toAnalyticsTraffic } from "@/core/lib/analytics/to-analytics-traffic"

const period = {
  days: 3,
  current: { startDate: "2026-10-11", endDate: "2026-10-13" },
  previous: { startDate: "2026-10-08", endDate: "2026-10-10" },
}

const value = (text: string) => ({ value: text })

const response = ga4BatchResponseSchema.parse({
  kind: "analyticsData#batchRunReports",
  reports: [
    {
      dimensionHeaders: [{ name: "date" }, { name: "dateRange" }],
      metricHeaders: [
        { name: "activeUsers", type: "TYPE_INTEGER" },
        { name: "screenPageViews", type: "TYPE_INTEGER" },
      ],
      rows: [
        {
          dimensionValues: [value("20261011"), value("current")],
          metricValues: [value("10"), value("30")],
        },
        {
          dimensionValues: [value("20261013"), value("current")],
          metricValues: [value("12"), value("40")],
        },
        {
          dimensionValues: [value("20261009"), value("date_range_1")],
          metricValues: [value("8"), value("20")],
        },
      ],
    },
    {
      dimensionHeaders: [{ name: "dateRange" }],
      metricHeaders: [{ name: "activeUsers" }, { name: "screenPageViews" }, { name: "sessions" }],
      rows: [
        {
          dimensionValues: [value("current")],
          metricValues: [value("20"), value("70"), value("25")],
        },
      ],
    },
    {
      dimensionHeaders: [{ name: "pagePath" }],
      metricHeaders: [{ name: "screenPageViews" }],
      rows: [
        { dimensionValues: [value("/")], metricValues: [value("50")] },
        { dimensionValues: [value("/news/hello")], metricValues: [value("20")] },
      ],
    },
    {
      dimensionHeaders: [{ name: "sessionDefaultChannelGroup" }],
      metricHeaders: [{ name: "sessions" }],
      rows: [
        { dimensionValues: [value("Organic Search")], metricValues: [value("15")] },
        { dimensionValues: [value("Audio")], metricValues: [value("1")] },
      ],
    },
  ],
})

const traffic = toAnalyticsTraffic({
  range: "7d",
  period,
  response,
  fetchedAt: new Date("2026-10-14T01:00:00Z"),
})

describe("toAnalyticsTraffic", () => {
  it("GA4 が返さなかった日は0で埋めて、期間の全日を並べる", () => {
    expect(traffic.dailyTrend).toEqual([
      { date: "2026-10-11", activeUsers: 10, screenPageViews: 30 },
      { date: "2026-10-12", activeUsers: 0, screenPageViews: 0 },
      { date: "2026-10-13", activeUsers: 12, screenPageViews: 40 },
    ])
  })

  it("前の期間の推移も同じ日数で並べる（date_range_1 は前の期間として読む）", () => {
    expect(traffic.previousDailyTrend).toEqual([
      { date: "2026-10-08", activeUsers: 0, screenPageViews: 0 },
      { date: "2026-10-09", activeUsers: 8, screenPageViews: 20 },
      { date: "2026-10-10", activeUsers: 0, screenPageViews: 0 },
    ])
  })

  it("合計の行が無い期間は0として扱う", () => {
    expect(traffic.totals).toEqual({
      current: { activeUsers: 20, screenPageViews: 70, sessions: 25 },
      previous: { activeUsers: 0, screenPageViews: 0, sessions: 0 },
    })
  })

  it("人気ページはパスと表示回数を順位どおりに並べる", () => {
    expect(traffic.topPages).toEqual([
      { path: "/", screenPageViews: 50 },
      { path: "/news/hello", screenPageViews: 20 },
    ])
  })

  it("流入元は日本語の表示名を付け、知らない分類は元の名前を使う", () => {
    expect(traffic.channels).toEqual([
      { channel: "Organic Search", label: "自然検索", sessions: 15 },
      { channel: "Audio", label: "Audio", sessions: 1 },
    ])
  })

  it("期間と取得時刻を残す", () => {
    expect(traffic.range).toBe("7d")
    expect(traffic.period).toEqual(period)
    expect(traffic.fetchedAt).toBe("2026-10-14T01:00:00.000Z")
  })
})

describe("ga4BatchResponseSchema", () => {
  it("行が1つも無いレポートは空の配列として読む", () => {
    const empty = ga4BatchResponseSchema.parse({ reports: [{}, {}, {}, {}] })

    expect(empty.reports[0].rows).toEqual([])
  })

  it("レポートが4つそろっていない応答は受け付けない", () => {
    expect(ga4BatchResponseSchema.safeParse({ reports: [{}] }).success).toBe(false)
  })
})
