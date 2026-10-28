import type { AnalyticsTraffic } from "@/core/lib/analytics/analytics-traffic-schema"
import { getAnalyticsPeriod } from "@/core/lib/analytics/get-analytics-period"

const FRESH_MILLISECONDS = 3 * 60 * 60 * 1000

type Props = {
  traffic: Pick<AnalyticsTraffic, "fetchedAt" | "range" | "period">
  now: Date
}

/**
 * 保存した結果を使い回してよいか。取得から3時間以内で、
 * かつ日本時間の日付が変わって表示する期間がずれていないこと。
 */
export function isAnalyticsTrafficFresh(props: Props): boolean {
  const age = props.now.getTime() - Date.parse(props.traffic.fetchedAt)

  if (!(age >= 0 && age < FRESH_MILLISECONDS)) return false

  const period = getAnalyticsPeriod({ range: props.traffic.range, now: props.now })

  return period.current.endDate === props.traffic.period.current.endDate
}
