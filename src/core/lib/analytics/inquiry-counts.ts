/** 問い合わせ件数。日ごとの件数は今の期間だけ持つ。 */
export type InquiryCounts = {
  daily: Array<{ date: string; count: number }>
  currentTotal: number
  previousTotal: number
}
