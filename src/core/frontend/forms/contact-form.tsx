"use client"

import Script from "next/script"
import React, { useActionState } from "react"

import { submitContactForm } from "@/core/frontend/forms/submit-contact-form"
import type { ContactSubmitResult } from "@/core/frontend/forms/types"
import { CONTACT_FIELD_LIMITS } from "@/core/frontend/forms/contact-form-constraints"
import { getUiDictionary } from "@/project/shared/lib/get-ui-dictionary"
import { defaultLocale, type Locale } from "@/project/shared/lib/locale-types"

type InquiryOption = { value: string; label: string }

type Props = {
  turnstileSiteKey?: string
  /**
   * お問い合わせ種別の選択肢。指定すると select で表示。
   * 未指定なら入力欄自体を出さない。案件側で差し替える想定。
   */
  inquiryOptions?: InquiryOption[]
  /** 会社名フィールドを表示するか。デフォルトは true。 */
  showCompanyName?: boolean
  locale?: Locale
}

function errorMessages(
  state: ContactSubmitResult | null,
  dictionary: ReturnType<typeof getUiDictionary>,
): string[] {
  if (!state) return []
  if (state.status === "validationFailed") return state.errors
  if (state.status === "turnstileFailed") return [dictionary.contactForm.turnstileFailed]
  if (state.status === "rateLimited") return [dictionary.contactForm.rateLimited]
  if (state.status === "serverError") return [dictionary.contactForm.serverError]
  return []
}

export function ContactForm(props: Props) {
  const showCompanyName = props.showCompanyName ?? true
  const dictionary = getUiDictionary(props.locale ?? defaultLocale)
  const [state, formAction, isPending] = useActionState(submitContactForm, null)
  const errors = errorMessages(state, dictionary)
  const inputClass = "w-full border border-border rounded px-3 py-2"

  return (
    <>
      {props.turnstileSiteKey ? (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
          strategy="afterInteractive"
        />
      ) : null}
      <form action={formAction} className="max-w-xl mx-auto p-6 space-y-4">
        <input type="hidden" name="locale" value={props.locale ?? defaultLocale} />
        {errors.length > 0 ? (
          <div role="alert" aria-live="assertive" className="space-y-1">
            {errors.map((message) => (
              <p key={message} className="text-error text-sm">
                {message}
              </p>
            ))}
          </div>
        ) : null}
        <label className="block">
          <span className="block text-sm mb-1">{dictionary.contactForm.name}</span>
          <input
            name="name"
            required
            maxLength={CONTACT_FIELD_LIMITS.name}
            className={inputClass}
          />
        </label>
        {showCompanyName ? (
          <label className="block">
            <span className="block text-sm mb-1">{dictionary.contactForm.companyNameOptional}</span>
            <input
              name="companyName"
              maxLength={CONTACT_FIELD_LIMITS.companyName}
              className={inputClass}
            />
          </label>
        ) : null}
        <label className="block">
          <span className="block text-sm mb-1">{dictionary.contactForm.email}</span>
          <input
            type="email"
            name="email"
            required
            maxLength={CONTACT_FIELD_LIMITS.email}
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="block text-sm mb-1">{dictionary.contactForm.phoneOptional}</span>
          <input name="phone" maxLength={CONTACT_FIELD_LIMITS.phone} className={inputClass} />
        </label>
        {props.inquiryOptions && props.inquiryOptions.length > 0 ? (
          <label className="block">
            <span className="block text-sm mb-1">{dictionary.contactForm.inquiryType}</span>
            <select name="inquiryType" required className={inputClass}>
              <option value="">{dictionary.contactForm.inquiryTypePlaceholder}</option>
              {props.inquiryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <label className="block">
          <span className="block text-sm mb-1">{dictionary.contactForm.message}</span>
          <textarea
            name="message"
            rows={6}
            required
            maxLength={CONTACT_FIELD_LIMITS.message}
            className={inputClass}
          />
        </label>
        {props.turnstileSiteKey ? (
          <div className="cf-turnstile" data-sitekey={props.turnstileSiteKey} />
        ) : null}
        <button
          type="submit"
          disabled={isPending}
          className="bg-brand text-white px-6 py-3 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? dictionary.contactForm.submitting : dictionary.contactForm.submit}
        </button>
      </form>
    </>
  )
}
