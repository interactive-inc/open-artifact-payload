const DAY_MILLISECONDS = 24 * 60 * 60 * 1000

/** YYYY-MM-DD の暦日を日数だけずらす。タイムゾーンの影響を受けないよう UTC で計算する。 */
export function shiftDate(date: string, days: number): string {
  return new Date(Date.parse(`${date}T00:00:00Z`) + days * DAY_MILLISECONDS)
    .toISOString()
    .slice(0, 10)
}
