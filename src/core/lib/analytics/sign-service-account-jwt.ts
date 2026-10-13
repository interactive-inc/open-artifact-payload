import { AnalyticsError } from "@/core/lib/analytics/analytics-error"
import type { Ga4ServiceAccount } from "@/core/lib/analytics/ga4-service-account-schema"
import { importPrivateKey } from "@/core/lib/analytics/import-private-key"
import { toBase64Url } from "@/core/lib/analytics/to-base64-url"

type Props = {
  account: Ga4ServiceAccount
  now: Date
}

const encodeJson = (value: object) => toBase64Url(new TextEncoder().encode(JSON.stringify(value)))

/** トークン交換に送る JWT を、閲覧専用スコープで RS256 署名する。有効期限は1時間。 */
export async function signServiceAccountJwt(props: Props): Promise<string | AnalyticsError> {
  const issuedAt = Math.floor(props.now.getTime() / 1000)

  const unsigned = `${encodeJson({ alg: "RS256", typ: "JWT", kid: props.account.privateKeyId })}.${encodeJson(
    {
      iss: props.account.clientEmail,
      scope: "https://www.googleapis.com/auth/analytics.readonly",
      aud: "https://oauth2.googleapis.com/token",
      iat: issuedAt,
      exp: issuedAt + 3600,
    },
  )}`

  try {
    const key = await importPrivateKey(props.account.privateKey)

    const signature = await crypto.subtle.sign(
      "RSASSA-PKCS1-v1_5",
      key,
      new TextEncoder().encode(unsigned),
    )

    return `${unsigned}.${toBase64Url(new Uint8Array(signature))}`
  } catch {
    return new AnalyticsError({ kind: "invalid-credentials", detail: "failed to sign the JWT" })
  }
}
