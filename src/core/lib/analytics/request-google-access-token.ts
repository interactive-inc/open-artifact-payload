import { AnalyticsError } from "@/core/lib/analytics/analytics-error"
import type { Fetcher } from "@/core/lib/analytics/fetcher"
import type { Ga4ServiceAccount } from "@/core/lib/analytics/ga4-service-account-schema"
import { signServiceAccountJwt } from "@/core/lib/analytics/sign-service-account-jwt"

type Props = {
  account: Ga4ServiceAccount
  now: Date
  fetcher: Fetcher
}

/** 署名した JWT を Google のトークン交換に送り、GA4 を読むためのアクセストークンを得る。 */
export async function requestGoogleAccessToken(props: Props): Promise<string | AnalyticsError> {
  const assertion = await signServiceAccountJwt({ account: props.account, now: props.now })

  if (assertion instanceof Error) return assertion

  // Workers の fetch は this 付きで呼ぶと Illegal invocation になるため、取り出してから呼ぶ
  const fetcher = props.fetcher

  try {
    const response = await fetcher("https://oauth2.googleapis.com/token", {
      method: "POST",
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion,
      }),
      signal: AbortSignal.timeout(10000),
    })

    if (response.status === 400 || response.status === 401) {
      return new AnalyticsError({
        kind: "invalid-credentials",
        detail: `token exchange ${response.status}`,
      })
    }

    if (!response.ok) {
      return new AnalyticsError({
        kind: "unavailable",
        detail: `token exchange ${response.status}`,
      })
    }

    const body: unknown = await response.json()

    if (
      body &&
      typeof body === "object" &&
      "access_token" in body &&
      typeof body.access_token === "string"
    ) {
      return body.access_token
    }

    return new AnalyticsError({
      kind: "invalid-response",
      detail: "token exchange without access_token",
    })
  } catch (error) {
    const name = error instanceof Error ? error.name : "unknown"

    return new AnalyticsError({ kind: "unavailable", detail: `token exchange failed (${name})` })
  }
}
