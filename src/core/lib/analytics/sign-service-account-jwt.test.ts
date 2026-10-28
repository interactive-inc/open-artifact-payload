import { describe, expect, it } from "vite-plus/test"

import { AnalyticsError } from "@/core/lib/analytics/analytics-error"
import { readGa4ServiceAccount } from "@/core/lib/analytics/read-ga4-service-account"
import { signServiceAccountJwt } from "@/core/lib/analytics/sign-service-account-jwt"
import { createTestServiceAccount } from "@/core/test-support/create-test-service-account"

const decodeSegment = (segment: string): unknown =>
  JSON.parse(atob(segment.replace(/-/g, "+").replace(/_/g, "/")))

const toBytes = (segment: string) =>
  Uint8Array.from(atob(segment.replace(/-/g, "+").replace(/_/g, "/")), (character) =>
    character.charCodeAt(0),
  )

describe("signServiceAccountJwt", () => {
  it("閲覧専用スコープでトークン交換用の JWT を RS256 で署名する", async () => {
    const testAccount = await createTestServiceAccount()
    const account = readGa4ServiceAccount(testAccount.json)
    if (account instanceof Error) throw account

    const jwt = await signServiceAccountJwt({ account, now: new Date("2026-10-14T00:00:00Z") })
    if (jwt instanceof Error) throw jwt

    const segments = jwt.split(".")
    expect(segments).toHaveLength(3)
    expect(decodeSegment(segments[0] ?? "")).toEqual({
      alg: "RS256",
      typ: "JWT",
      kid: "test-key-id",
    })
    expect(decodeSegment(segments[1] ?? "")).toEqual({
      iss: "analytics@example-project.iam.gserviceaccount.com",
      scope: "https://www.googleapis.com/auth/analytics.readonly",
      aud: "https://oauth2.googleapis.com/token",
      iat: 1791936000,
      exp: 1791939600,
    })

    const isValid = await crypto.subtle.verify(
      "RSASSA-PKCS1-v1_5",
      testAccount.publicKey,
      toBytes(segments[2] ?? ""),
      new TextEncoder().encode(`${segments[0]}.${segments[1]}`),
    )
    expect(isValid).toBe(true)
  })

  it("鍵として読めない秘密鍵は鍵の形式エラーにする", async () => {
    const jwt = await signServiceAccountJwt({
      account: {
        clientEmail: "a@example.com",
        privateKey: "-----BEGIN PRIVATE KEY-----\nAAAA\n-----END PRIVATE KEY-----",
        privateKeyId: "id",
      },
      now: new Date(),
    })

    expect(jwt instanceof AnalyticsError && jwt.kind).toBe("invalid-credentials")
  })
})
