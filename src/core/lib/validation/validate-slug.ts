import { SLUG_MAX_LENGTH } from "@/core/lib/validation/text-limits"

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/**
 * 公開 URL に使うスラッグ。半角小文字英数字とハイフンのみを許可する。
 * 空値は required 側の責務なので true を返す。
 */
export function validateSlug(value: string | null | undefined): true | string {
  if (!value) return true

  if (value.length > SLUG_MAX_LENGTH) {
    return `スラッグは${SLUG_MAX_LENGTH}文字以内で入力してください`
  }

  if (!SLUG_PATTERN.test(value)) {
    return "スラッグは半角小文字の英数字とハイフンのみで入力してください。先頭と末尾にハイフンは使えません"
  }

  return true
}
