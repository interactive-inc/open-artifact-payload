// ログへ残す前にメールアドレスを伏せる。ローカル部に記号を含むアドレスも拾う
const emailPattern = /[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+/g

const maxLength = 200

const valueMask = "[redacted]"

/**
 * 例外やエラー文字列を、ログに出して安全な短い文字列へ整える。
 * エラー文には入力値がそのまま echo されることがあるため、判明している送信内容
 * (redactedValues) を伏せ、メールアドレスは [email] へ置換し、長い本文や
 * API レスポンスが丸ごとログへ流れないよう 200 文字で打ち切る。
 */
export function sanitizeErrorMessage(
  value: unknown,
  redactedValues: ReadonlyArray<string> = [],
): string {
  const raw = value instanceof Error ? value.message : String(value)
  const emailMasked = raw.replace(emailPattern, "[email]")
  const masked = redactedValues
    .reduce((message, secret) => {
      if (secret.length === 0) return message

      return message.split(secret).join(valueMask)
    }, emailMasked)
    .replace(/\s+/g, " ")
    .trim()

  if (masked.length <= maxLength) return masked

  return `${masked.slice(0, maxLength)}…`
}
