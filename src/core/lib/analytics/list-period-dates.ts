import type { DateSpan } from "@/core/lib/analytics/analytics-period"
import { shiftDate } from "@/core/lib/analytics/shift-date"

const DAY_MILLISECONDS = 24 * 60 * 60 * 1000

/** 期間に含まれる暦日を古い順に並べる。 */
export function listPeriodDates(span: DateSpan): string[] {
  const length =
    (Date.parse(`${span.endDate}T00:00:00Z`) - Date.parse(`${span.startDate}T00:00:00Z`)) /
      DAY_MILLISECONDS +
    1

  return Array.from({ length }, (_value, index) => shiftDate(span.startDate, index))
}
