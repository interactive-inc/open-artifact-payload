import type { AnalyticsTraffic } from "@/core/lib/analytics/analytics-traffic-schema"
import { toMetricNumber } from "@/core/lib/analytics/to-metric-number"

/** 人気ページの行を、GA4 が並べた順位のままパスと表示回数にする。 */
export function toTopPages(rows: Array<Record<string, string>>): AnalyticsTraffic["topPages"] {
  return rows.map((row) => ({
    path: row.pagePath ?? "",
    screenPageViews: toMetricNumber(row.screenPageViews),
  }))
}
