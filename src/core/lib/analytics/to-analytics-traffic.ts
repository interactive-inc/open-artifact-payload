import type { AnalyticsPeriod } from "@/core/lib/analytics/analytics-period"
import type { AnalyticsRange } from "@/core/lib/analytics/analytics-range"
import type { AnalyticsTraffic } from "@/core/lib/analytics/analytics-traffic-schema"
import type { Ga4BatchResponse } from "@/core/lib/analytics/ga4-batch-response-schema"
import { readGa4ReportRows } from "@/core/lib/analytics/read-ga4-report-rows"
import { toChannels } from "@/core/lib/analytics/to-channels"
import { toDailyTrend } from "@/core/lib/analytics/to-daily-trend"
import { toTopPages } from "@/core/lib/analytics/to-top-pages"
import { toTrafficTotals } from "@/core/lib/analytics/to-traffic-totals"

type Props = {
  range: AnalyticsRange
  period: AnalyticsPeriod
  response: Ga4BatchResponse
  fetchedAt: Date
}

/** batchRunReports の4つの応答を、画面に出す集計結果へまとめる。 */
export function toAnalyticsTraffic(props: Props): AnalyticsTraffic {
  const trendRows = readGa4ReportRows(props.response.reports[0])

  const totalRows = readGa4ReportRows(props.response.reports[1])

  const trend = (periodKey: "current" | "previous") =>
    toDailyTrend({ rows: trendRows, span: props.period[periodKey], periodKey })

  return {
    range: props.range,
    fetchedAt: props.fetchedAt.toISOString(),
    period: props.period,
    dailyTrend: trend("current"),
    previousDailyTrend: trend("previous"),
    totals: {
      current: toTrafficTotals(totalRows, "current"),
      previous: toTrafficTotals(totalRows, "previous"),
    },
    topPages: toTopPages(readGa4ReportRows(props.response.reports[2])),
    channels: toChannels(readGa4ReportRows(props.response.reports[3])),
  }
}
