import type { AnalyticsErrorKind } from "@/core/lib/analytics/analytics-error-kind"

/** GA4 Data API の HTTP ステータスを、画面に出す失敗の種類へ振り分ける。 */
export function classifyGa4Status(status: number): AnalyticsErrorKind {
  if (status === 401 || status === 403) return "unauthorized"

  if (status === 400 || status === 404) return "rejected"

  if (status === 429) return "rate-limited"

  return "unavailable"
}
