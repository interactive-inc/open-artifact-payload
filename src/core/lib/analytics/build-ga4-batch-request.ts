import type { AnalyticsPeriod } from "@/core/lib/analytics/analytics-period"
import type { Ga4ReportRequest } from "@/core/lib/analytics/ga4-report-request"

const descending = (metricName: string) => [{ metric: { metricName }, desc: true }]

/**
 * 推移・合計・人気ページ・流入元の4種類を batchRunReports の1回にまとめる。
 * 期間に名前を付け、応答の dateRange 次元で今と前の期間を見分ける。
 */
export function buildGa4BatchRequest(period: AnalyticsPeriod): { requests: Ga4ReportRequest[] } {
  const current = { name: "current", ...period.current }

  const bothRanges = [current, { name: "previous", ...period.previous }]

  const metric = (name: string) => ({ name })

  return {
    requests: [
      {
        dateRanges: bothRanges,
        dimensions: [{ name: "date" }],
        metrics: [metric("activeUsers"), metric("screenPageViews")],
        orderBys: [],
        limit: "1000",
      },
      {
        dateRanges: bothRanges,
        dimensions: [],
        metrics: [metric("activeUsers"), metric("screenPageViews"), metric("sessions")],
        orderBys: [],
        limit: "10",
      },
      {
        dateRanges: [current],
        dimensions: [{ name: "pagePath" }],
        metrics: [metric("screenPageViews")],
        orderBys: descending("screenPageViews"),
        limit: "10",
      },
      {
        dateRanges: [current],
        dimensions: [{ name: "sessionDefaultChannelGroup" }],
        metrics: [metric("sessions")],
        orderBys: descending("sessions"),
        limit: "50",
      },
    ],
  }
}
