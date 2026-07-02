// Server Action の境界は submit-contact-form.ts ('use server') 側にある。
// ここはサーバー専用の純ロジック (テストからも直接呼ぶ) なので 'use server' は付けない。
import { getPayload } from 'payload'

import { sendContactNotification } from '@/core/lib/email/send-contact-notification'
import config from '@/payload.config'
import type { ContactSubmitResult } from '@/core/frontend/forms/types'

type Options = {
  verifyTurnstile?: (token: string) => Promise<boolean>
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

async function defaultVerifyTurnstile(token: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  // TURNSTILE_SECRET_KEY 未設定時はローカル開発とみなして検証をスキップする
  if (!secret) return true
  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: new URLSearchParams({ secret, response: token }),
    })
    const raw: unknown = await response.json()
    if (
      raw !== null &&
      typeof raw === 'object' &&
      'success' in raw &&
      typeof raw.success === 'boolean'
    ) {
      return raw.success
    }
    return false
  } catch {
    // ネットワーク障害時はスパム対策として fail-closed（通さない）
    return false
  }
}

function collectErrors(props: { name: string; email: string; message: string }): string[] {
  const errors: string[] = []
  if (!props.name) errors.push('お名前を入力してください')
  if (!props.email) errors.push('メールアドレスを入力してください')
  if (props.email && !EMAIL_PATTERN.test(props.email)) {
    errors.push('メールアドレスの形式が正しくありません')
  }
  if (!props.message) errors.push('本文を入力してください')
  return errors
}

// FormData.get() の戻り値が string でなければ空文字に倒す。
// multipart で File にすり替えるとデフォルトで `[object File]` という文字列が DB に入ってしまう。
function readField(formData: FormData, name: string): string {
  const value = formData.get(name)
  return typeof value === 'string' ? value.trim() : ''
}

export async function submitContact(
  formData: FormData,
  options: Options = {},
): Promise<ContactSubmitResult> {
  const name = readField(formData, 'name')
  const email = readField(formData, 'email')
  const phone = readField(formData, 'phone')
  const companyName = readField(formData, 'companyName')
  const inquiryType = readField(formData, 'inquiryType')
  const message = readField(formData, 'message')
  // Cloudflare Turnstile はウィジェットが hidden input `cf-turnstile-response` を注入する
  const turnstileToken = readField(formData, 'cf-turnstile-response')

  const errors = collectErrors({ name, email, message })
  if (errors.length > 0) {
    return { status: 'validationFailed', errors }
  }

  const verify = options.verifyTurnstile ?? defaultVerifyTurnstile
  const passed = await verify(turnstileToken)
  if (!passed) {
    return { status: 'turnstileFailed' }
  }

  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  try {
    await payload.create({
      collection: 'contact-submissions',
      data: {
        name,
        email,
        phone: phone.length > 0 ? phone : undefined,
        companyName: companyName.length > 0 ? companyName : undefined,
        inquiryType: inquiryType.length > 0 ? inquiryType : undefined,
        message,
        status: 'new',
      },
    })
  } catch (error) {
    // D1 タイムアウト / ロック / スキーマ不整合などを catch して
    // UI 側で再試行可能な状態にする (action が reject して UI が固まらないように)。
    const reason = error instanceof Error ? error.message : String(error)
    console.error('[contact] 問い合わせ保存失敗:', reason)
    return { status: 'serverError' }
  }

  // 通知メールの失敗は CMS への保存をブロックしない（取りこぼし防止）
  const notification = await sendContactNotification({
    name,
    email,
    phone,
    companyName,
    inquiryType,
    message,
  })
  if (notification.status === 'failed') {
    console.error('[contact] 通知メール送信失敗:', notification.error)
  }

  return { status: 'ok' }
}
