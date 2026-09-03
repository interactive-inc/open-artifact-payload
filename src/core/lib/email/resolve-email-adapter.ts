import { resendAdapter } from "@payloadcms/email-resend"
import type { PayloadEmailAdapter } from "payload"

import { parseEmailFrom } from "@/core/lib/email/parse-email-from"

/**
 * Payload に渡すメールアダプタを環境変数から組み立てる。
 *
 * RESEND_API_KEY と送信元 (EMAIL_FROM、無ければ CONTACT_NOTIFICATION_FROM) が揃ったときだけ
 * Resend アダプタを返す。揃わない場合は undefined を返し、Payload 既定の console アダプタへ
 * フォールバックする (ローカル開発では送信せず宛先と件名だけがログに出る)。
 *
 * パスワード再設定などの認証メールと問い合わせ通知は、どちらもこの 1 経路を通る。
 */
export function resolveEmailAdapter(): PayloadEmailAdapter | undefined {
  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) return undefined

  const from = [process.env.EMAIL_FROM, process.env.CONTACT_NOTIFICATION_FROM].find(
    (value) => typeof value === "string" && value.trim().length > 0,
  )

  if (!from) return undefined

  const parsed = parseEmailFrom(from)

  if (parsed instanceof Error) {
    console.warn(`[email] 送信元の設定を解釈できませんでした: ${parsed.message}`)
    return undefined
  }

  return resendAdapter({
    apiKey,
    defaultFromAddress: parsed.address,
    defaultFromName: parsed.name,
  })
}
