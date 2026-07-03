import type { Locale } from '@/project/shared/lib/locale-types'

type FormattedDate = {
  // <time dateTime> 用の YYYY-MM-DD
  dateTime: string
  // 画面表示用 (例: 2026年6月25日 / June 25, 2026)
  label: string
}

// 日本の案件向けテンプレートとして JST 基準で日付を組み立てる。
// Cloudflare Workers は実行時タイムゾーンが UTC のため明示が必要。
const TIME_ZONE = 'Asia/Tokyo'
const isoFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})
const labelFormatters: Record<Locale, Intl.DateTimeFormat> = {
  ja: new Intl.DateTimeFormat('ja-JP', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }),
  en: new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }),
}

/**
 * 公開日などの日付文字列を表示用に整形する。
 * 値が空、または不正な日付 (下書き/autosave で publishedAt 未入力など) の場合は null を返す。
 * dateTime と label は同一タイムゾーン (JST) を基準にして整合させる。
 */
export function formatNewsDate(
  value: string | null | undefined,
  locale: Locale,
): FormattedDate | null {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return {
    dateTime: isoFormatter.format(date),
    label: labelFormatters[locale].format(date),
  }
}
