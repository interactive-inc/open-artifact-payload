const JST_OFFSET_MILLISECONDS = 9 * 60 * 60 * 1000

/** ISO 日時を日本時間の「月/日 時:分」にする。取得時刻の表示に使う。 */
export function formatJstDateTime(iso: string): string {
  const jst = new Date(Date.parse(iso) + JST_OFFSET_MILLISECONDS)

  const pad = (value: number) => String(value).padStart(2, "0")

  return `${jst.getUTCMonth() + 1}/${jst.getUTCDate()} ${pad(jst.getUTCHours())}:${pad(jst.getUTCMinutes())}`
}
