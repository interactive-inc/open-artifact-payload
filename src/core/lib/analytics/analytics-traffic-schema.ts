import { z } from "zod"

import { ANALYTICS_RANGES } from "@/core/lib/analytics/analytics-range"

const dateSpanSchema = z.object({ startDate: z.string(), endDate: z.string() })

const trendPointSchema = z.object({
  date: z.string(),
  activeUsers: z.number(),
  screenPageViews: z.number(),
})

const trafficTotalsSchema = z.object({
  activeUsers: z.number(),
  screenPageViews: z.number(),
  sessions: z.number(),
})

/** 画面に出す GA4 の集計結果。KV に保存し、読み戻すときもこの形で確かめる。 */
export const analyticsTrafficSchema = z.object({
  range: z.enum(ANALYTICS_RANGES),
  fetchedAt: z.iso.datetime(),
  period: z.object({ days: z.number(), current: dateSpanSchema, previous: dateSpanSchema }),
  dailyTrend: z.array(trendPointSchema),
  previousDailyTrend: z.array(trendPointSchema),
  totals: z.object({ current: trafficTotalsSchema, previous: trafficTotalsSchema }),
  topPages: z.array(z.object({ path: z.string(), screenPageViews: z.number() })),
  channels: z.array(z.object({ channel: z.string(), label: z.string(), sessions: z.number() })),
})

export type AnalyticsTraffic = z.infer<typeof analyticsTrafficSchema>

export type TrendPoint = z.infer<typeof trendPointSchema>

export type TrafficTotals = z.infer<typeof trafficTotalsSchema>
