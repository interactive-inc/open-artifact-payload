/** GA4 の指標値（文字列）を数値にする。読めない値は0として扱う。 */
export function toMetricNumber(value: string | undefined): number {
  const parsed = Number(value)

  return Number.isFinite(parsed) ? parsed : 0
}
