// Server Action の境界は submit-contact-form.ts ('use server') 側にある。
// ここはサーバー専用の純ロジック (テストからも直接呼ぶ) なので 'use server' は付けない。
import { getPayload } from "payload"
import { getCloudflareContext } from "@opennextjs/cloudflare"

import { deliverContactNotification } from "@/core/lib/email/deliver-contact-notification"
import { sanitizeErrorMessage } from "@/core/lib/email/sanitize-error-message"
import config from "@/payload.config"
import type { ContactSubmitResult } from "@/core/frontend/forms/types"
import {
  readContactFormFields,
  validateContactFormFields,
} from "@/core/frontend/forms/contact-form-constraints"

import { verifyTurnstileToken } from "@/core/frontend/forms/verify-turnstile-token"

type RateLimitDecision = "allowed" | "limited" | "unavailable"
type Options = {
  verifyTurnstile?: (token: string) => Promise<boolean>
  checkRateLimit?: (key: string) => Promise<RateLimitDecision>
  // 通知メール失敗時の再試行までの待ち時間。テストから短縮するための注入口
  notificationRetryDelayMs?: number
}

const defaultNotificationRetryDelayMs = 1000

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
    console.error("[contact] レート制限の確認に失敗しました:", sanitizeErrorMessage(reason))
    return "unavailable"
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
    console.error(
      "[contact] レート制限キーの生成に失敗しました:",
      sanitizeErrorMessage(reason, [fields.email]),
    )
    return { status: "serverError" }
  }

  const checkRateLimit = options.checkRateLimit ?? defaultCheckRateLimit
  const rateLimitDecision = await checkRateLimit(rateLimitKey)
  if (rateLimitDecision === "limited") return { status: "rateLimited" }
  if (rateLimitDecision === "unavailable") return { status: "serverError" }

  if (
    process.env.NODE_ENV === "production" &&
    !options.verifyTurnstile &&
    !process.env.TURNSTILE_SECRET_KEY?.trim()
  ) {
    console.error("[contact] TURNSTILE_SECRET_KEY が本番環境に設定されていません")
    return { status: "serverError" }
  }

  const verify = options.verifyTurnstile ?? verifyTurnstileToken
  const passed = await verify(fields.turnstileToken)
  if (!passed) {
    return { status: "turnstileFailed" }
  }

  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  // D1 タイムアウト / ロック / スキーマ不整合などを拾って
  // UI 側で再試行可能な状態にする (action が reject して UI が固まらないように)。
  const submission = await payload
    .create({
      collection: "contact-submissions",
      // 入力・レート制限・Turnstileを検証済みのServer Action専用経路。
      overrideAccess: true,
      data: {
        name: fields.name,
        email: fields.email,
        phone: fields.phone.length > 0 ? fields.phone : null,
        companyName: fields.companyName.length > 0 ? fields.companyName : null,
        inquiryType: fields.inquiryType.length > 0 ? fields.inquiryType : null,
        message: fields.message,
        status: "new",
        notificationStatus: "pending",
      },
    })
    .catch((error: unknown) => {
      // 保存エラーには送信内容が echo されうるため、伏せ字と長さ制限をかけてから記録する
      console.error(
        "[contact] 問い合わせ保存失敗:",
        sanitizeErrorMessage(error, [
          fields.name,
          fields.email,
          fields.message,
          fields.phone,
          fields.companyName,
        ]),
      )
      return null
    })

  if (!submission) return { status: "serverError" }

  // 通知メールの失敗は CMS への保存をブロックしない（取りこぼし防止）。
  // 一時障害に備えて 1 度だけ再試行し、最終結果はレコードの通知状態へ残る。
  const delivery = await deliverContactNotification({ payload, submissionId: submission.id })

  if (delivery instanceof Error || delivery.status !== "failed") {
    return { status: "ok" }
  }

  console.error("[contact] 通知メール送信失敗:", delivery.error)

  const retryDelayMs = options.notificationRetryDelayMs ?? defaultNotificationRetryDelayMs

  await new Promise((resolve) => setTimeout(resolve, retryDelayMs))

  const retried = await deliverContactNotification({ payload, submissionId: submission.id })

  if (retried instanceof Error) {
    console.error("[contact] 通知メールの再試行に失敗しました:", retried.message)
    return { status: "ok" }
  }

  if (retried.status === "failed") {
    console.error("[contact] 通知メールの再試行も失敗しました:", retried.error)
  }

  return { status: "ok" }
}
