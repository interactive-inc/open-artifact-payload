// ログへ残す前にメールアドレスを伏せる。ローカル部に記号を含むアドレスも拾う
const emailPattern = /[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+/g

const maxLength = 200

/**
 * 例外やエラー文字列を、ログに出して安全な短い文字列へ整える。
 * メールアドレスは [email] へ置換し、長い本文や API レスポンスが丸ごと
 * ログへ流れないよう 200 文字で打ち切る。
 */
export function sanitizeErrorMessage(value: unknown): string {
  const raw = value instanceof Error ? value.message : String(value)
  const masked = raw.replace(emailPattern, "[email]").replace(/\s+/g, " ").trim()

  if (masked.length <= maxLength) return masked

  return `${masked.slice(0, maxLength)}…`
}
