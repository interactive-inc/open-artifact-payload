import type { AnalyticsTraffic } from "@/core/lib/analytics/analytics-traffic-schema"
import type { InquiryCounts } from "@/core/lib/analytics/inquiry-counts"
import { listPeriodDates } from "@/core/lib/analytics/list-period-dates"

const period = {
  days: 28,
  current: { startDate: "2026-09-16", endDate: "2026-10-13" },
  previous: { startDate: "2026-08-19", endDate: "2026-09-15" },
}

const wave = (index: number, base: number) => base + ((index * 7) % 11) + (index % 7 === 5 ? -8 : 0)

// Storybook / テスト用のアクセス解析のサンプル（28日間）。
export const exampleAnalyticsTraffic: AnalyticsTraffic = {
  range: "28d",
  fetchedAt: "2026-10-14T01:12:00.000Z",
  period,
  dailyTrend: listPeriodDates(period.current).map((date, index) => ({
    date,
    activeUsers: wave(index, 40),
    screenPageViews: wave(index, 40) * 3,
  })),
  previousDailyTrend: listPeriodDates(period.previous).map((date, index) => ({
    date,
    activeUsers: wave(index, 34),
    screenPageViews: wave(index, 34) * 3,
  })),
  totals: {
    current: { activeUsers: 1284, screenPageViews: 4031, sessions: 1702 },
    previous: { activeUsers: 1146, screenPageViews: 3733, sessions: 1755 },
  },
  topPages: [
    { path: "/", screenPageViews: 1102 },
    { path: "/works/brand-renewal", screenPageViews: 412 },
    { path: "/news/2026-autumn", screenPageViews: 288 },
    { path: "/about", screenPageViews: 201 },
    { path: "/contact", screenPageViews: 150 },
  ],
  channels: [
    { channel: "Organic Search", label: "自然検索", sessions: 980 },
    { channel: "Direct", label: "直接", sessions: 455 },
    { channel: "Organic Social", label: "SNS", sessions: 190 },
    { channel: "Referral", label: "他サイトからのリンク", sessions: 77 },
  ],
}

export const exampleInquiryCounts: InquiryCounts = {
  daily: listPeriodDates(period.current).map((date, index) => ({
    date,
    count: index % 3 === 1 ? 1 : 0,
  })),
  currentTotal: 9,
  previousTotal: 7,
}

export const exampleAnalyticsPeriod = period
