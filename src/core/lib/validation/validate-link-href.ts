import { HREF_MAX_LENGTH } from "@/core/lib/validation/text-limits"
import { validateHttpsUrl } from "@/core/lib/validation/validate-https-url"

const MAILTO_OR_TEL_PATTERN = /^(?:mailto:|tel:)\S+$/

/**
 * ナビゲーション・ポリシーリンク・CTA のリンク先。
 * 内部パス (/ 始まり)、ページ内リンク (# 始まり)、https:// の絶対 URL、mailto:、tel: だけを許可する。
 * javascript: や data: のような実行可能スキームと、// 始まりのプロトコル相対 URL は拒否する。
 */
export function validateLinkHref(value: string | null | undefined): true | string {
  if (!value) return true

  if (value.length > HREF_MAX_LENGTH) {
    return `リンクは${HREF_MAX_LENGTH}文字以内で入力してください`
  }

  if (/\s/.test(value)) return "リンクに空白や改行は使えません"

  // ブラウザは /\evil.example を //evil.example と同じ外部 URL として解釈するため、
  // バックスラッシュを含む値は内部パスとして受け付けない
  if (value.includes("\\")) return "リンクにバックスラッシュは使えません"

  if (value.startsWith("#")) return true

  if (value.startsWith("/") && !value.startsWith("//")) return true

  if (value.startsWith("https://")) return validateHttpsUrl(value)

  if (MAILTO_OR_TEL_PATTERN.test(value)) return true

  return "リンクは / で始まる内部パス、https:// の URL、mailto:、tel: のいずれかで入力してください"
}
