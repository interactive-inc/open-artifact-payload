import { HREF_MAX_LENGTH } from "@/core/lib/validation/text-limits"

// ホスト部 ([^/?#\s]+) を必須にすることで https:// だけの値や空ホストを弾く。
const HTTPS_URL_PATTERN = /^https:\/\/[^/?#\s]+(?:[/?#]\S*)?$/

/**
 * SNS リンクなど、外部サイトを指す URL。https:// の絶対 URL のみ許可する。
 * 空値は任意入力として通す。
 */
export function validateHttpsUrl(value: string | null | undefined): true | string {
  if (!value) return true

  if (value.length > HREF_MAX_LENGTH) {
    return `URL は${HREF_MAX_LENGTH}文字以内で入力してください`
  }

  if (!HTTPS_URL_PATTERN.test(value)) {
    return "URL は https:// から始まる絶対 URL で入力してください"
  }

  return true
}
