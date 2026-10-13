const JST_OFFSET_MILLISECONDS = 9 * 60 * 60 * 1000

/** 日本時間の暦日を YYYY-MM-DD で返す。 */
export function toJstDate(instant: Date): string {
  return new Date(instant.getTime() + JST_OFFSET_MILLISECONDS).toISOString().slice(0, 10)
}
