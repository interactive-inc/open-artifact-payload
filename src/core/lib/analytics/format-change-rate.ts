/** 増減率を「▲12%」「▼3%」の形にする。比べられないときはダッシュ。 */
export function formatChangeRate(rate: number | null): string {
  if (rate === null) return "—"

  if (rate > 0) return `▲${rate}%`

  if (rate < 0) return `▼${Math.abs(rate)}%`

  return "±0%"
}
