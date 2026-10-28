import type { DateSpan } from "@/core/lib/analytics/analytics-period"
import type { TrendPoint } from "@/core/lib/analytics/analytics-traffic-schema"
import { listPeriodDates } from "@/core/lib/analytics/list-period-dates"
import { toMetricNumber } from "@/core/lib/analytics/to-metric-number"
import { toPeriodKey, type PeriodKey } from "@/core/lib/analytics/to-period-key"

type Props = {
  rows: Array<Record<string, string>>
  span: DateSpan
  periodKey: PeriodKey
}

/** 日ごとの推移を期間の全日で並べる。GA4 は値が0の日を返さないため0で埋める。 */
export function toDailyTrend(props: Props): TrendPoint[] {
  const rowsByDate = new Map(
    props.rows
      .filter((row) => toPeriodKey(row.dateRange) === props.periodKey)
      .map((row) => [(row.date ?? "").replace(/^(\d{4})(\d{2})(\d{2})$/, "$1-$2-$3"), row]),
  )

  return listPeriodDates(props.span).map((date) => {
    const row = rowsByDate.get(date)

    return {
      date,
      activeUsers: toMetricNumber(row?.activeUsers),
      screenPageViews: toMetricNumber(row?.screenPageViews),
    }
  })
}
