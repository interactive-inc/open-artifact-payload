export const ANALYTICS_RANGES = ["7d", "28d", "90d"] as const

export type AnalyticsRange = (typeof ANALYTICS_RANGES)[number]

export const DEFAULT_ANALYTICS_RANGE: AnalyticsRange = "28d"

export const ANALYTICS_RANGE_DAYS: Record<AnalyticsRange, number> = {
  "7d": 7,
  "28d": 28,
  "90d": 90,
}
