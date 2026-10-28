import { beforeAll, describe, expect, it } from "vite-plus/test"

import { AnalyticsError } from "@/core/lib/analytics/analytics-error"
import type { Ga4ServiceAccount } from "@/core/lib/analytics/ga4-service-account-schema"
import { readGa4ServiceAccount } from "@/core/lib/analytics/read-ga4-service-account"
import { requestGoogleAccessToken } from "@/core/lib/analytics/request-google-access-token"
import { createTestServiceAccount } from "@/core/test-support/create-test-service-account"

let account: Ga4ServiceAccount

const respondWith = (status: number, body: string) => async () => new Response(body, { status })

describe("requestGoogleAccessToken", () => {
  beforeAll(async () => {
    const testAccount = await createTestServiceAccount()
    const parsed = readGa4ServiceAccount(testAccount.json)
    if (parsed instanceof Error) throw parsed
    account = parsed
  })

  it("署名した JWT を Google のトークン交換に送り、アクセストークンを返す", async () => {
    const requests: Request[] = []
    const fetcher = async (input: RequestInfo | URL, init?: RequestInit) => {
      requests.push(new Request(input, init))
      return Response.json({ access_token: "ya29.test-token", expires_in: 3599 })
    }

    const token = await requestGoogleAccessToken({ account, now: new Date(), fetcher })

    expect(token).toBe("ya29.test-token")
    expect(requests[0]?.url).toBe("https://oauth2.googleapis.com/token")
    const body = new URLSearchParams(await requests[0]?.text())
    expect(body.get("grant_type")).toBe("urn:ietf:params:oauth:grant-type:jwt-bearer")
    expect(body.get("assertion")?.split(".")).toHaveLength(3)
  })

  it("Google が鍵を拒否したら鍵の設定エラーにする", async () => {
    const token = await requestGoogleAccessToken({
      account,
      now: new Date(),
      fetcher: respondWith(400, JSON.stringify({ error: "invalid_grant" })),
    })

    expect(token instanceof AnalyticsError && token.kind).toBe("invalid-credentials")
  })

  it("通信に失敗したら応答なしとして扱う", async () => {
    const token = await requestGoogleAccessToken({
      account,
      now: new Date(),
      fetcher: async () => {
        throw new TypeError("network down")
      },
    })

    expect(token instanceof AnalyticsError && token.kind).toBe("unavailable")
  })

  it("アクセストークンが入っていない応答は形式エラーにする", async () => {
    const token = await requestGoogleAccessToken({
      account,
      now: new Date(),
      fetcher: respondWith(200, JSON.stringify({ token_type: "Bearer" })),
    })

    expect(token instanceof AnalyticsError && token.kind).toBe("invalid-response")
  })
})
