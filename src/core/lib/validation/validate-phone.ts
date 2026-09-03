import { PHONE_MAX_LENGTH } from "@/core/lib/validation/text-limits"

const PHONE_PATTERN = /^[0-9+\-() ]+$/

/**
 * TEL / FAX の入力。数字と国番号・区切り記号だけを許可し、
 * 改行や任意テキストが電話リンクへ流れ込むのを防ぐ。
 */
export function validatePhone(value: string | null | undefined): true | string {
  if (!value) return true

  if (value.length > PHONE_MAX_LENGTH) {
    return `電話番号は${PHONE_MAX_LENGTH}文字以内で入力してください`
  }

  if (!PHONE_PATTERN.test(value)) {
    return "電話番号は数字と + - ( ) 半角スペースのみで入力してください"
  }

  return true
}
