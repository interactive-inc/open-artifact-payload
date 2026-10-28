import type { AnalyticsRange } from "@/core/lib/analytics/analytics-range"

export const ANALYTICS_STATUS_KEY = "analytics:status"

/**
 * GA4 の結果を保存する KV のキー。プロパティ ID を含め、
 * ID を変えた直後に別プロパティの数字を出さないようにする。
 */
export function getAnalyticsTrafficKey(propertyId: string, range: AnalyticsRange): string {
  return `analytics:traffic:${propertyId}:${range}`
}
