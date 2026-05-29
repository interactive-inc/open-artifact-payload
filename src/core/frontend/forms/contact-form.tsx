'use client'

import React, { useState } from 'react'

import { submitContact } from './contact-form-action'

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

type FormState = 'idle' | 'submitting' | 'done' | 'error'

export function ContactForm(props: Props) {
  const [state, setState] = useState<FormState>('idle')
  const [errors, setErrors] = useState<string[]>([])
  const showCompanyName = props.showCompanyName ?? true

  return (
    <form
      action={async (formData) => {
        setState('submitting')
        setErrors([])
        const result = await submitContact(formData)
        if (result.status === 'ok') {
          setState('done')
          window.location.href = '/contact/thanks'
          return
        }
        if (result.status === 'validationFailed') {
          setErrors(result.errors)
        }
        if (result.status === 'turnstileFailed') {
          setErrors(['スパム判定されました。もう一度お試しください'])
        }
        setState('error')
      }}
      className="max-w-xl mx-auto p-6 space-y-4"
    >
      {errors.map((message) => (
        <p key={message} className="text-red-600 text-sm">
          {message}
        </p>
      ))}
      <label className="block">
        <span className="block text-sm mb-1">お名前</span>
        <input name="name" required className="w-full border rounded px-3 py-2" />
      </label>
      {showCompanyName ? (
        <label className="block">
          <span className="block text-sm mb-1">会社名 (任意)</span>
          <input name="companyName" className="w-full border rounded px-3 py-2" />
        </label>
      ) : null}
      <label className="block">
        <span className="block text-sm mb-1">メールアドレス</span>
        <input type="email" name="email" required className="w-full border rounded px-3 py-2" />
      </label>
      <label className="block">
        <span className="block text-sm mb-1">電話番号 (任意)</span>
        <input name="phone" className="w-full border rounded px-3 py-2" />
      </label>
      {props.inquiryOptions && props.inquiryOptions.length > 0 ? (
        <label className="block">
          <span className="block text-sm mb-1">お問い合わせ種別</span>
          <select name="inquiryType" required className="w-full border rounded px-3 py-2">
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
        <textarea name="message" rows={6} required className="w-full border rounded px-3 py-2" />
      </label>
      {props.turnstileSiteKey ? (
        <div
          className="cf-turnstile"
          data-sitekey={props.turnstileSiteKey}
          data-callback="onTurnstile"
        />
      ) : (
        <input type="hidden" name="turnstileToken" value="dev-bypass" />
      )}
      <button
        type="submit"
        disabled={state === 'submitting'}
        className="bg-brand text-white px-6 py-3 rounded"
      >
        {state === 'submitting' ? '送信中...' : '送信する'}
      </button>
    </form>
  )
}
