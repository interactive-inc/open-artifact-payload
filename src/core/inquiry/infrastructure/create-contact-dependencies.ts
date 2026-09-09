import { getPayload } from "payload"
import config from "@/payload.config"
import { deliverContactNotification } from "@/core/inquiry/infrastructure/deliver-contact-notification"
import { sanitizeErrorMessage } from "@/core/lib/email/sanitize-error-message"
import type {
  ContactAcceptanceDependencies,
  RateLimitDecision,
} from "@/core/inquiry/application/accept-contact"
import { createContactRateLimitKey } from "@/core/inquiry/infrastructure/create-contact-rate-limit-key"
import { checkContactRateLimit } from "@/core/inquiry/infrastructure/check-contact-rate-limit"
import { verifyTurnstileToken } from "@/core/inquiry/infrastructure/verify-turnstile-token"
import { saveContactSubmission } from "@/core/inquiry/infrastructure/save-contact-submission"

export type ContactSubmissionOptions = {
  verifyTurnstile?: (token: string) => Promise<boolean>
  checkRateLimit?: (key: string) => Promise<RateLimitDecision>
  notificationRetryDelayMs?: number
}

/** リクエストごとの接続を組み立てる。Payloadの取得・保存は検証通過後に行う。 */
export function createContactDependencies(
  options: ContactSubmissionOptions,
): ContactAcceptanceDependencies {
  return {
    createRateLimitKey: async (email) => {
      try {
        return await createContactRateLimitKey(email)
      } catch (error) {
        console.error(
          "[contact] レート制限キーの生成に失敗しました:",
          sanitizeErrorMessage(error, [email]),
        )
        return new Error("レート制限キーを生成できません")
      }
    },
    checkRateLimit: options.checkRateLimit ?? checkContactRateLimit,
    verifyTurnstile: async (token) => {
      if (
        process.env.NODE_ENV === "production" &&
        !options.verifyTurnstile &&
        !process.env.TURNSTILE_SECRET_KEY?.trim()
      ) {
        console.error("[contact] TURNSTILE_SECRET_KEY が本番環境に設定されていません")
        return new Error("Turnstileが設定されていません")
      }
      return (options.verifyTurnstile ?? verifyTurnstileToken)(token)
    },
    saveSubmission: saveContactSubmission,
    notify: async (submissionId) => {
      const payload = await getPayload({ config: await config })
      return deliverContactNotification({ payload, submissionId })
    },
    wait: (milliseconds) =>
      new Promise((resolve) =>
        setTimeout(resolve, options.notificationRetryDelayMs ?? milliseconds),
      ),
    reportNotificationFailure: (stage, reason) => {
      console.error(
        stage === "initial"
          ? "[contact] 通知メール送信失敗:"
          : "[contact] 通知メールの再試行に失敗しました:",
        sanitizeErrorMessage(reason),
      )
    },
  }
}
