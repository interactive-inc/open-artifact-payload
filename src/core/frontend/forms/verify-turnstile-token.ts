import { CONTACT_FIELD_LIMITS } from "@/core/frontend/forms/contact-form-constraints"

/** 外部検証の失敗・タイムアウト・設定不足では保存を許可しない。 */
export async function verifyTurnstileToken(token: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim()
  if (!secret) {
    return (
      process.env.NODE_ENV !== "production" && process.env.TURNSTILE_ALLOW_INSECURE_LOCAL === "true"
    )
  }
  if (!token || token.length > CONTACT_FIELD_LIMITS.turnstileToken) return false

  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: new URLSearchParams({ secret, response: token }),
      signal: AbortSignal.timeout(10000),
    })
    if (!response.ok) return false
    const result: unknown = await response.json()
    return (
      result !== null &&
      typeof result === "object" &&
      "success" in result &&
      result.success === true
    )
  } catch {
    return false
  }
}
