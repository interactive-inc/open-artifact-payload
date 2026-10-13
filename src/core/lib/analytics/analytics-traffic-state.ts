import type { AnalyticsErrorKind } from "@/core/lib/analytics/analytics-error-kind"
import type { AnalyticsTraffic } from "@/core/lib/analytics/analytics-traffic-schema"

/** ダッシュボードに出す GA4 部分の状態。 */
export type AnalyticsTrafficState =
  | { status: "ready"; traffic: AnalyticsTraffic }
  | { status: "stale"; traffic: AnalyticsTraffic; errorKind: AnalyticsErrorKind }
  | { status: "failed"; errorKind: AnalyticsErrorKind }
  | { status: "not-configured" }
