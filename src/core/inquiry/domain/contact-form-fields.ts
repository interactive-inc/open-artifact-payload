export const CONTACT_FIELD_LIMITS = {
  name: 100,
  companyName: 200,
  email: 254,
  phone: 50,
  inquiryType: 32,
  message: 5_000,
  turnstileToken: 2_048,
} as const

export type ContactFormFields = {
  name: string
  companyName: string
  email: string
  phone: string
  inquiryType: string
  message: string
  turnstileToken: string
}
