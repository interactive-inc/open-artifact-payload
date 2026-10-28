export type PeriodKey = "current" | "previous"

/**
 * 応答の dateRange 次元を今と前の期間に振り分ける。
 * 期間名を付けて送るが、名前が反映されない場合の既定名 date_range_N も読む。
 */
export function toPeriodKey(value: string | undefined): PeriodKey | null {
  if (value === "current" || value === "date_range_0") return "current"

  if (value === "previous" || value === "date_range_1") return "previous"

  return null
}
