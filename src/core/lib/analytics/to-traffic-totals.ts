import type { TrafficTotals } from "@/core/lib/analytics/analytics-traffic-schema"
import { toMetricNumber } from "@/core/lib/analytics/to-metric-number"
import { toPeriodKey, type PeriodKey } from "@/core/lib/analytics/to-period-key"

/** 期間ごとの合計を読む。すべて0の期間は GA4 が行を返さないため0として扱う。 */
export function toTrafficTotals(
  rows: Array<Record<string, string>>,
  periodKey: PeriodKey,
): TrafficTotals {
  const row = rows.find((candidate) => toPeriodKey(candidate.dateRange) === periodKey)

  return {
    activeUsers: toMetricNumber(row?.activeUsers),
    screenPageViews: toMetricNumber(row?.screenPageViews),
    sessions: toMetricNumber(row?.sessions),
  }
}
