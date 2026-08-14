// Server Action の境界は submit-contact-form.ts ('use server') 側にある。
// ここはサーバー専用の純ロジック (テストからも直接呼ぶ) なので 'use server' は付けない。
import { getPayload } from "payload"
import { getCloudflareContext } from "@opennextjs/cloudflare"

import { sendContactNotification } from "@/core/lib/email/send-contact-notification"
import config from "@/payload.config"
import type { ContactSubmitResult } from "@/core/frontend/forms/types"
import {
  readContactFormFields,
  validateContactFormFields,
} from "@/core/frontend/forms/contact-form-constraints"

type RateLimitDecision = "allowed" | "limited" | "unavailable"
type Options = {
  verifyTurnstile?: (token: string) => Promise<boolean>
  checkRateLimit?: (key: string) => Promise<RateLimitDecision>
}

async function createRateLimitKey(email: string): Promise<string> {
  const siteScope = process.env.NEXT_PUBLIC_SERVER_URL ?? "open-artifact-payload"
  const source = new TextEncoder().encode(`${siteScope}\0${email.toLowerCase()}`)
  const digest = await crypto.subtle.digest("SHA-256", source)
  const hex = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  )
  return `contact:${hex}`
}

async function defaultCheckRateLimit(key: string): Promise<RateLimitDecision> {
  // Cloudflare の Rate Limiting binding はデプロイ済み Worker でのみ必須にする。
  // ローカルとテストでは Options から実装を注入して分岐を検証できる。
  if (process.env.NODE_ENV !== "production") return "allowed"

  try {
    const { env } = await getCloudflareContext({ async: true })
    const limiter = env.CONTACT_RATE_LIMITER
    if (!limiter) {
      console.error("[contact] CONTACT_RATE_LIMITER binding が設定されていません")
      return "unavailable"
    }
    const outcome = await limiter.limit({ key })
    return outcome.success ? "allowed" : "limited"
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error)
    console.error("[contact] レート制限の確認に失敗しました:", reason)
    return "unavailable"
  }
}

async function defaultVerifyTurnstile(token: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  // ローカルだけは未設定を許可する。本番の設定不足は submitContact 側で保存前に拒否する。
  if (!secret) return process.env.NODE_ENV !== "production"
  if (!token) return false
  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: new URLSearchParams({ secret, response: token }),
    })
    const raw: unknown = await response.json()
    if (
      raw !== null &&
      typeof raw === "object" &&
      "success" in raw &&
      typeof raw.success === "boolean"
    ) {
      return raw.success
    }
    return false
  } catch {
    // ネットワーク障害時はスパム対策として fail-closed（通さない）
    return false
  }
}

export async function submitContact(
  formData: FormData,
  options: Options = {},
): Promise<ContactSubmitResult> {
  const fields = readContactFormFields(formData)

  const errors = validateContactFormFields(fields)
  if (errors.length > 0) {
    return { status: "validationFailed", errors }
  }

  let rateLimitKey: string
  try {
    rateLimitKey = await createRateLimitKey(fields.email)
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error)
    console.error("[contact] レート制限キーの生成に失敗しました:", reason)
    return { status: "serverError" }
  }

  const checkRateLimit = options.checkRateLimit ?? defaultCheckRateLimit
  const rateLimitDecision = await checkRateLimit(rateLimitKey)
  if (rateLimitDecision === "limited") return { status: "rateLimited" }
  if (rateLimitDecision === "unavailable") return { status: "serverError" }

  if (
    process.env.NODE_ENV === "production" &&
    !options.verifyTurnstile &&
    !process.env.TURNSTILE_SECRET_KEY
  ) {
    console.error("[contact] TURNSTILE_SECRET_KEY が本番環境に設定されていません")
    return { status: "serverError" }
  }

  const verify = options.verifyTurnstile ?? defaultVerifyTurnstile
  const passed = await verify(fields.turnstileToken)
  if (!passed) {
    return { status: "turnstileFailed" }
  }

  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  try {
    await payload.create({
      collection: "contact-submissions",
      data: {
        name: fields.name,
        email: fields.email,
        phone: fields.phone.length > 0 ? fields.phone : undefined,
        companyName: fields.companyName.length > 0 ? fields.companyName : undefined,
        inquiryType: fields.inquiryType.length > 0 ? fields.inquiryType : undefined,
        message: fields.message,
        status: "new",
      },
    })
  } catch (error) {
    // D1 タイムアウト / ロック / スキーマ不整合などを catch して
    // UI 側で再試行可能な状態にする (action が reject して UI が固まらないように)。
    const reason = error instanceof Error ? error.message : String(error)
    console.error("[contact] 問い合わせ保存失敗:", reason)
    return { status: "serverError" }
  }

  // 通知メールの失敗は CMS への保存をブロックしない（取りこぼし防止）
  const notification = await sendContactNotification({
    name: fields.name,
    email: fields.email,
    phone: fields.phone,
    companyName: fields.companyName,
    inquiryType: fields.inquiryType,
    message: fields.message,
  })
  if (notification.status === "failed") {
    console.error("[contact] 通知メール送信失敗:", notification.error)
  }

  return { status: "ok" }
}
