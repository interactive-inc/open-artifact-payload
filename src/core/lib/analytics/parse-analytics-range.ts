import {
  ANALYTICS_RANGES,
  DEFAULT_ANALYTICS_RANGE,
  type AnalyticsRange,
} from "@/core/lib/analytics/analytics-range"

/** URL パラメータの期間を読む。未対応の値は既定の28日に寄せる。 */
export function parseAnalyticsRange(value: unknown): AnalyticsRange {
  const matched = ANALYTICS_RANGES.find((range) => range === value)

  return matched ?? DEFAULT_ANALYTICS_RANGE
}
