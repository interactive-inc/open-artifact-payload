import { getCloudflareContext } from "@opennextjs/cloudflare"
import { sanitizeErrorMessage } from "@/core/lib/email/sanitize-error-message"
import type { RateLimitDecision } from "@/core/inquiry/application/accept-contact"

export async function checkContactRateLimit(key: string): Promise<RateLimitDecision> {
  // Cloudflare の Rate Limiting binding はデプロイ済み Worker でのみ必須にする。
  // ローカルとテストでは受付手順へ操作を注入して分岐を検証できる。
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
