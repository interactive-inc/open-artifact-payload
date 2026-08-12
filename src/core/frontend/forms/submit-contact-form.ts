"use server"

import { submitContact } from "@/core/frontend/forms/contact-form-action"
import type { ContactSubmitResult } from "@/core/frontend/forms/types"

/**
 * useActionState 用のサーバーアクション。検証・保存結果をクライアントへ返し、
 * 成功時の遷移はContactForm側で行う。
 */
export async function submitContactForm(
  _previousState: ContactSubmitResult | null,
  formData: FormData,
): Promise<ContactSubmitResult | null> {
  return submitContact(formData)
}
