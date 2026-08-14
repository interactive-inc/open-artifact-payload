export const CONTACT_FIELD_LIMITS = {
  name: 100,
  companyName: 200,
  email: 254,
  phone: 50,
  inquiryType: 32,
  message: 5_000,
  turnstileToken: 2_048,
} as const

export const CONTACT_INQUIRY_TYPES = [
  "service",
  "estimate",
  "consultation",
  "recruitment",
  "media",
  "other",
] as const

export type ContactInquiryType = (typeof CONTACT_INQUIRY_TYPES)[number]

export type ContactFormFields = {
  name: string
  companyName: string
  email: string
  phone: string
  inquiryType: string
  message: string
  turnstileToken: string
}

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

function readField(formData: FormData, name: string): string {
  const value = formData.get(name)
  return typeof value === "string" ? value.trim() : ""
}

export function readContactFormFields(formData: FormData): ContactFormFields {
  return {
    name: readField(formData, "name"),
    companyName: readField(formData, "companyName"),
    email: readField(formData, "email"),
    phone: readField(formData, "phone"),
    inquiryType: readField(formData, "inquiryType"),
    message: readField(formData, "message"),
    // Cloudflare Turnstile はこの hidden input をウィジェットから注入する。
    turnstileToken: readField(formData, "cf-turnstile-response"),
  }
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

  if (
    fields.inquiryType &&
    !CONTACT_INQUIRY_TYPES.includes(fields.inquiryType as ContactInquiryType)
  ) {
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
