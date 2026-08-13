"use server"

import { redirect } from "next/navigation"

import { submitContact } from "@/core/frontend/forms/contact-form-action"
import type { ContactSubmitResult } from "@/core/frontend/forms/types"
import { isLocale } from "@/project/shared/lib/is-locale"
import { defaultLocale } from "@/project/shared/lib/locale-types"
import { withLocalePrefix } from "@/project/shared/lib/with-locale-prefix"

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
