import type { ContactFormFields } from "@/core/inquiry/domain/contact-form-fields"

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
