import type { ContactFormFields } from "@/core/inquiry/domain/contact-form-fields"
import { validateContactFormFields } from "@/core/inquiry/domain/validate-contact-form-fields"
import type { ContactSubmitResult } from "@/core/inquiry/application/contact-submit-result"
import type { ContactNotificationDelivery } from "@/core/inquiry/application/contact-notification-delivery"

export type RateLimitDecision = "allowed" | "limited" | "unavailable"

export type ContactAcceptanceDependencies = {
  createRateLimitKey: (email: string) => Promise<string | Error>
  checkRateLimit: (key: string) => Promise<RateLimitDecision>
  verifyTurnstile: (token: string) => Promise<boolean | Error>
  saveSubmission: (fields: ContactFormFields) => Promise<number | null>
  notify: (submissionId: number) => Promise<ContactNotificationDelivery | Error>
  wait: (milliseconds: number) => Promise<void>
  reportNotificationFailure: (stage: "initial" | "retry", reason: string) => void
}

/** 保存済みの問い合わせは通知に失敗しても成功とし、配信失敗だけを1秒後に一度再試行する。 */
async function notifyContact(submissionId: number, dependencies: ContactAcceptanceDependencies) {
  const delivery = await dependencies.notify(submissionId)
  if (delivery instanceof Error || delivery.status !== "failed") return

  dependencies.reportNotificationFailure("initial", delivery.error)
  await dependencies.wait(1000)
  const retried = await dependencies.notify(submissionId)
  if (retried instanceof Error) {
    dependencies.reportNotificationFailure("retry", retried.message)
  } else if (retried.status === "failed") {
    dependencies.reportNotificationFailure("retry", retried.error)
  }
}

/** 入力検証、頻度制限、Turnstile、保存、通知の順序を所有する。外部接続は入口で渡す。 */
export async function acceptContact(
  fields: ContactFormFields,
  dependencies: ContactAcceptanceDependencies,
): Promise<ContactSubmitResult> {
  const errors = validateContactFormFields(fields)
  if (errors.length > 0) return { status: "validationFailed", errors }

  const rateLimitKey = await dependencies.createRateLimitKey(fields.email)
  if (rateLimitKey instanceof Error) return { status: "serverError" }
  const rateLimitDecision = await dependencies.checkRateLimit(rateLimitKey)
  if (rateLimitDecision === "limited") return { status: "rateLimited" }
  if (rateLimitDecision === "unavailable") return { status: "serverError" }

  const passed = await dependencies.verifyTurnstile(fields.turnstileToken)
  if (passed instanceof Error) return { status: "serverError" }
  if (!passed) return { status: "turnstileFailed" }

  const submissionId = await dependencies.saveSubmission(fields)
  if (submissionId === null) return { status: "serverError" }

  await notifyContact(submissionId, dependencies)
  return { status: "ok" }
}
