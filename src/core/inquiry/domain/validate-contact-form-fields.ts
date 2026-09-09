import {
  CONTACT_FIELD_LIMITS,
  type ContactFormFields,
} from "@/core/inquiry/domain/contact-form-fields"
import { CONTACT_INQUIRY_TYPES } from "@/core/inquiry/domain/contact-inquiry-type"

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function hasForbiddenControlCharacter(value: string): boolean {
  for (const character of value) {
    const codePoint = character.codePointAt(0)
    if (
      codePoint !== undefined &&
      (codePoint <= 8 ||
        codePoint === 11 ||
        codePoint === 12 ||
        (codePoint >= 14 && codePoint <= 31) ||
        codePoint === 127)
    ) {
      return true
    }
  }
  return false
}

function addLengthError(errors: string[], label: string, value: string, maximum: number): void {
  if (value.length > maximum) {
    errors.push(`${label}は${maximum}文字以内で入力してください`)
  }
}

export function validateContactFormFields(fields: ContactFormFields): string[] {
  const errors: string[] = []

  if (!fields.name) errors.push("お名前を入力してください")
  if (!fields.email) errors.push("メールアドレスを入力してください")
  if (fields.email && !EMAIL_PATTERN.test(fields.email)) {
    errors.push("メールアドレスの形式が正しくありません")
  }
  if (!fields.message) errors.push("本文を入力してください")

  addLengthError(errors, "お名前", fields.name, CONTACT_FIELD_LIMITS.name)
  addLengthError(errors, "会社名", fields.companyName, CONTACT_FIELD_LIMITS.companyName)
  addLengthError(errors, "メールアドレス", fields.email, CONTACT_FIELD_LIMITS.email)
  addLengthError(errors, "電話番号", fields.phone, CONTACT_FIELD_LIMITS.phone)
  addLengthError(errors, "お問い合わせ種別", fields.inquiryType, CONTACT_FIELD_LIMITS.inquiryType)
  addLengthError(errors, "本文", fields.message, CONTACT_FIELD_LIMITS.message)
  addLengthError(
    errors,
    "Turnstileトークン",
    fields.turnstileToken,
    CONTACT_FIELD_LIMITS.turnstileToken,
  )

  if (fields.inquiryType && !CONTACT_INQUIRY_TYPES.some((code) => code === fields.inquiryType)) {
    errors.push("お問い合わせ種別の値が正しくありません")
  }

  const textFields = [
    fields.name,
    fields.companyName,
    fields.email,
    fields.phone,
    fields.inquiryType,
    fields.message,
  ]
  if (textFields.some((value) => hasForbiddenControlCharacter(value))) {
    errors.push("入力内容に使用できない制御文字が含まれています")
  }

  return errors
}
