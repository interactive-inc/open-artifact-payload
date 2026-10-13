import type { AnalyticsPeriod } from "@/core/lib/analytics/analytics-period"
import { ANALYTICS_RANGE_DAYS, type AnalyticsRange } from "@/core/lib/analytics/analytics-range"
import { shiftDate } from "@/core/lib/analytics/shift-date"
import { toJstDate } from "@/core/lib/analytics/to-jst-date"

type Props = {
  range: AnalyticsRange
  now: Date
}

/**
 * 表示する期間と、比較する直前の同じ長さの期間を日本時間の暦日で求める。
 * 今日は集計途中で少なく見えるため、終わりは昨日にする。
 */
export function getAnalyticsPeriod(props: Props): AnalyticsPeriod {
  const days = ANALYTICS_RANGE_DAYS[props.range]

  const endDate = shiftDate(toJstDate(props.now), -1)

  const startDate = shiftDate(endDate, -(days - 1))

  return {
    days,
    current: { startDate, endDate },
    previous: { startDate: shiftDate(startDate, -days), endDate: shiftDate(startDate, -1) },
  }
}
