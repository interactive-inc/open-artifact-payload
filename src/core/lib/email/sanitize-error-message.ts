const EMAIL_PATTERN = /[^\s@]+@[^\s@]+/g
const MAX_LENGTH = 200
const EMAIL_MASK = "[email]"
const VALUE_MASK = "[redacted]"

type Props = {
  message: string
  redactedValues?: ReadonlyArray<string>
}

/**
 * 外部サービスやドライバのエラー文字列をログに出せる形へ落とす。
 *
 * エラー文には入力値がそのまま echo されることがあるため、判明している送信内容を
 * 伏せ字にしてからメールアドレスを一律でマスクし、長い応答本文が流れないよう切り詰める。
 */
export function sanitizeErrorMessage(props: Props): string {
  const redacted = (props.redactedValues ?? []).reduce((message, value) => {
    if (value.length === 0) return message

    return message.split(value).join(VALUE_MASK)
  }, props.message)

  const masked = redacted.replace(EMAIL_PATTERN, EMAIL_MASK)
  if (masked.length <= MAX_LENGTH) return masked

  return masked.slice(0, MAX_LENGTH)
}
