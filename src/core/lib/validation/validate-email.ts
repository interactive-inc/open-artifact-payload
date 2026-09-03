import { type EmailFieldValidation, validations } from "payload"

import { CONTACT_FIELD_LIMITS } from "@/core/frontend/forms/contact-form-constraints"

/**
 * Payload 標準のメール形式チェックに、保存前の長さ上限を足したもの。
 * 上限は問い合わせフォームの制約と同じ値を使い、フォームと CMS で判定を揃える。
 */
export const validateEmail: EmailFieldValidation = async (value, options) => {
  const formatResult = await validations.email(value, options)

  if (formatResult !== true) return formatResult

  if (!value) return true

  if (value.length > CONTACT_FIELD_LIMITS.email) {
    return `メールアドレスは${CONTACT_FIELD_LIMITS.email}文字以内で入力してください`
  }

  return true
}
