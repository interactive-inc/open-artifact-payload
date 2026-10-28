import type { Payload } from "payload"

import type { AnalyticsPeriod } from "@/core/lib/analytics/analytics-period"
import { shiftDate } from "@/core/lib/analytics/shift-date"
import { toJstDate } from "@/core/lib/analytics/to-jst-date"

type Props = {
  payload: Payload
  period: AnalyticsPeriod
}

/**
 * 前の期間の開始から今の期間の終わりまでに届いた問い合わせの、日本時間の受付日を返す。
 * 読むのは作成日時だけで、問い合わせの内容は読まない。
 */
export async function findInquiryDates(props: Props): Promise<string[] | Error> {
  try {
    const submissions = await props.payload.find({
      collection: "contact-submissions",
      where: {
        createdAt: {
          greater_than_equal: `${props.period.previous.startDate}T00:00:00+09:00`,
          less_than: `${shiftDate(props.period.current.endDate, 1)}T00:00:00+09:00`,
        },
      },
      select: { createdAt: true },
      depth: 0,
      pagination: false,
    })

    return submissions.docs.map((submission) => toJstDate(new Date(submission.createdAt)))
  } catch (error) {
    return error instanceof Error ? error : new Error("failed to read inquiry dates")
  }
}
