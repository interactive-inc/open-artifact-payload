'use server'

import { getPayload } from 'payload'

import { sendContactNotification } from '@/core/lib/email/send-contact-notification'
import config from '@/payload.config'

type SubmitResult =
  | { status: 'ok' }
  | { status: 'validationFailed'; errors: string[] }
  | { status: 'turnstileFailed' }

type Options = {
  verifyTurnstile?: (token: string) => Promise<boolean>
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

async function defaultVerifyTurnstile(token: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  // TURNSTILE_SECRET_KEY 未設定時はローカル開発とみなして検証をスキップする
  if (!secret) return true
  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: new URLSearchParams({ secret, response: token }),
  })
  const raw: unknown = await response.json()
  if (raw !== null && typeof raw === 'object' && 'success' in raw && typeof raw.success === 'boolean') {
    return raw.success
  }
  return false
}

export async function submitContact(
  formData: FormData,
  options: Options = {},
): Promise<SubmitResult> {
  const name = formData.get('name')?.toString().trim() ?? ''
  const email = formData.get('email')?.toString().trim() ?? ''
  const phone = formData.get('phone')?.toString().trim() ?? ''
  const companyName = formData.get('companyName')?.toString().trim() ?? ''
  const inquiryType = formData.get('inquiryType')?.toString().trim() ?? ''
  const message = formData.get('message')?.toString().trim() ?? ''
  const turnstileToken = formData.get('turnstileToken')?.toString() ?? ''

  const errors: string[] = []
  if (!name) errors.push('お名前を入力してください')
  if (!email) {
    errors.push('メールアドレスを入力してください')
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.push('メールアドレスの形式が正しくありません')
  }
  if (!message) errors.push('本文を入力してください')
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
