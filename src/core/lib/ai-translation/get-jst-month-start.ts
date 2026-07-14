const jstOffsetMs = 9 * 60 * 60 * 1000

/**
 * AI翻訳の利用上限は日本時間の月初で区切って集計する。
 */
export function getJstMonthStart(now: Date): Date {
  const jstNow = new Date(now.getTime() + jstOffsetMs)

  return new Date(Date.UTC(jstNow.getUTCFullYear(), jstNow.getUTCMonth(), 1) - jstOffsetMs)
}
