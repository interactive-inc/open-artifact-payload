"use server"

import { redirect } from "next/navigation"

import { submitContact } from "@/core/inquiry/actions/submit-contact"
import type { ContactSubmitResult } from "@/core/inquiry/application/contact-submit-result"
import { isLocale } from "@/i18n/is-locale"
import { defaultLocale } from "@/i18n/locale-types"
import { withLocalePrefix } from "@/i18n/with-locale-prefix"

/**
 * useActionState 用のサーバーアクション。成功時はサーバーから遷移させるため、
 * JavaScriptの読み込みやhydrationに失敗しても通常のform送信が成立する。
 */
export async function submitContactForm(
  _previousState: ContactSubmitResult | null,
  formData: FormData,
): Promise<ContactSubmitResult | null> {
  const result = await submitContact(formData)

  if (result.status === "ok") {
    const localeValue = formData.get("locale")
    const locale =
      typeof localeValue === "string" && isLocale(localeValue) ? localeValue : defaultLocale
    redirect(withLocalePrefix(locale, "/contact/thanks"))
  }

  return result
}
