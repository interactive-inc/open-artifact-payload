'use client'

import Script from 'next/script'
import React, { useActionState } from 'react'

import { submitContactForm } from '@/core/frontend/forms/submit-contact-form'
import type { ContactSubmitResult } from '@/core/frontend/forms/types'

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
}

function errorMessages(state: ContactSubmitResult | null): string[] {
  if (!state) return []
  if (state.status === 'validationFailed') return state.errors
  if (state.status === 'turnstileFailed') return ['スパム判定されました。もう一度お試しください']
  if (state.status === 'serverError') {
    return ['送信中にエラーが発生しました。しばらく待ってからもう一度お試しください']
  }
  return []
}

export function ContactForm(props: Props) {
  const showCompanyName = props.showCompanyName ?? true
  const [state, formAction, isPending] = useActionState(submitContactForm, null)
  const errors = errorMessages(state)
  const inputClass = 'w-full border border-border rounded px-3 py-2'

  return (
    <>
      {props.turnstileSiteKey ? (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
          strategy="afterInteractive"
        />
      ) : null}
      <form action={formAction} className="max-w-xl mx-auto p-6 space-y-4">
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
          <span className="block text-sm mb-1">お名前</span>
          <input name="name" required className={inputClass} />
        </label>
        {showCompanyName ? (
          <label className="block">
            <span className="block text-sm mb-1">会社名 (任意)</span>
            <input name="companyName" className={inputClass} />
          </label>
        ) : null}
        <label className="block">
          <span className="block text-sm mb-1">メールアドレス</span>
          <input type="email" name="email" required className={inputClass} />
        </label>
        <label className="block">
          <span className="block text-sm mb-1">電話番号 (任意)</span>
          <input name="phone" className={inputClass} />
        </label>
        {props.inquiryOptions && props.inquiryOptions.length > 0 ? (
          <label className="block">
            <span className="block text-sm mb-1">お問い合わせ種別</span>
            <select name="inquiryType" required className={inputClass}>
              <option value="">選択してください</option>
              {props.inquiryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <label className="block">
          <span className="block text-sm mb-1">お問い合わせ内容</span>
          <textarea name="message" rows={6} required className={inputClass} />
        </label>
        {props.turnstileSiteKey ? (
          <div className="cf-turnstile" data-sitekey={props.turnstileSiteKey} />
        ) : null}
        <button
          type="submit"
          disabled={isPending}
          className="bg-brand text-white px-6 py-3 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? '送信中...' : '送信する'}
        </button>
      </form>
    </>
  )
}
