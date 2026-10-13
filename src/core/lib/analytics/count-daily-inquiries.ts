import type { Payload } from "payload"

import type { AnalyticsPeriod } from "@/core/lib/analytics/analytics-period"
import { findInquiryDates } from "@/core/lib/analytics/find-inquiry-dates"
import type { InquiryCounts } from "@/core/lib/analytics/inquiry-counts"
import { listPeriodDates } from "@/core/lib/analytics/list-period-dates"

type Props = {
  payload: Payload
  period: AnalyticsPeriod
}

/** 問い合わせを日本時間の日ごとに数え、今と前の期間の合計を出す。 */
export async function countDailyInquiries(props: Props): Promise<InquiryCounts | Error> {
  const dates = await findInquiryDates(props)

  if (dates instanceof Error) return dates

  const daily = listPeriodDates(props.period.current).map((date) => ({
    date,
    count: dates.filter((candidate) => candidate === date).length,
  }))

  return {
    daily,
    currentTotal: daily.reduce((total, day) => total + day.count, 0),
    previousTotal: dates.filter((date) => date <= props.period.previous.endDate).length,
  }
}
