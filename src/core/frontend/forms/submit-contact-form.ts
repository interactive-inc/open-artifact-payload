'use server'

import { redirect } from 'next/navigation'

import { submitContact } from '@/core/frontend/forms/contact-form-action'
import type { ContactSubmitResult } from '@/core/frontend/forms/types'

/**
 * useActionState 用のサーバーアクション。送信成功時はサーバー側 redirect で
 * /contact/thanks へソフトナビゲーションする（フルリロードしない）。
 * 失敗時は検証結果を返してフォームにエラーを表示させる。
 */
export async function submitContactForm(
  _previousState: ContactSubmitResult | null,
  formData: FormData,
): Promise<ContactSubmitResult | null> {
  const result = await submitContact(formData)
  if (result.status === 'ok') {
    redirect('/contact/thanks')
  }
  return result
}
