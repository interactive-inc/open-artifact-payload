import { AnalyticsError } from "@/core/lib/analytics/analytics-error"
import {
  ga4ServiceAccountSchema,
  type Ga4ServiceAccount,
} from "@/core/lib/analytics/ga4-service-account-schema"

/**
 * 環境変数 GA4_SERVICE_ACCOUNT_JSON の値を読む。
 * 失敗しても値そのものはエラーに含めない（秘密鍵が画面やログへ出ないように）。
 */
export function readGa4ServiceAccount(
  json: string | undefined,
): Ga4ServiceAccount | AnalyticsError {
  if (!json?.trim()) {
    return new AnalyticsError({
      kind: "not-configured",
      detail: "GA4_SERVICE_ACCOUNT_JSON is not set",
    })
  }

  try {
    const parsed = ga4ServiceAccountSchema.safeParse(JSON.parse(json))

    if (parsed.success) return parsed.data
  } catch {
    // JSON として読めない場合も下の形式エラーにまとめる
  }

  return new AnalyticsError({
    kind: "invalid-credentials",
    detail: "GA4_SERVICE_ACCOUNT_JSON is not a service account key",
  })
}
