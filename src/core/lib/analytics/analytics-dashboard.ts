import type { AnalyticsPeriod } from "@/core/lib/analytics/analytics-period"
import type { AnalyticsTrafficState } from "@/core/lib/analytics/analytics-traffic-state"
import type { InquiryCounts } from "@/core/lib/analytics/inquiry-counts"

/** ダッシュボードの解析パネルに渡す材料。問い合わせ件数を数えられなければ null。 */
export type AnalyticsDashboard = {
  period: AnalyticsPeriod
  trafficState: AnalyticsTrafficState
  inquiries: InquiryCounts | null
}
