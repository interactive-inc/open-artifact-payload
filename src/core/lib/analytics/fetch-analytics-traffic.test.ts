import { describe, expect, it } from "vite-plus/test"

import { AnalyticsError } from "@/core/lib/analytics/analytics-error"
import { fetchAnalyticsTraffic } from "@/core/lib/analytics/fetch-analytics-traffic"
import { createTestServiceAccount } from "@/core/test-support/create-test-service-account"

describe("fetchAnalyticsTraffic", () => {
  it("トークンを取得して GA4 に問い合わせ、画面用の集計結果を返す", async () => {
    const testAccount = await createTestServiceAccount()
    const urls: string[] = []
    const fetcher = async (input: RequestInfo | URL, init?: RequestInit) => {
      const request = new Request(input, init)
      urls.push(request.url)
      if (request.url.startsWith("https://oauth2.googleapis.com/")) {
        return Response.json({ access_token: "ya29.token" })
      }
      return Response.json({ reports: [{}, {}, {}, {}] })
    }

    const traffic = await fetchAnalyticsTraffic({
      range: "7d",
      propertyId: "123456789",
      serviceAccountJson: testAccount.json,
      now: new Date("2026-10-14T03:00:00Z"),
      fetcher,
    })

    if (traffic instanceof Error) throw traffic
    expect(urls).toEqual([
      "https://oauth2.googleapis.com/token",
      "https://analyticsdata.googleapis.com/v1beta/properties/123456789:batchRunReports",
    ])
    expect(traffic.period.current).toEqual({ startDate: "2026-10-07", endDate: "2026-10-13" })
    expect(traffic.dailyTrend).toHaveLength(7)
    expect(traffic.fetchedAt).toBe("2026-10-14T03:00:00.000Z")
  })

  it("鍵が無ければ GA4 に問い合わせず未接続を返す", async () => {
    const traffic = await fetchAnalyticsTraffic({
      range: "28d",
      propertyId: "123456789",
      serviceAccountJson: undefined,
      now: new Date(),
      fetcher: async () => {
        throw new Error("呼ばれてはいけない")
      },
    })

    expect(traffic instanceof AnalyticsError && traffic.kind).toBe("not-configured")
  })

  it("トークンが取れなければ GA4 に問い合わせない", async () => {
    const testAccount = await createTestServiceAccount()
    const urls: string[] = []

    const traffic = await fetchAnalyticsTraffic({
      range: "28d",
      propertyId: "123456789",
      serviceAccountJson: testAccount.json,
      now: new Date(),
      fetcher: async (input) => {
        urls.push(new Request(input).url)
        return new Response("{}", { status: 400 })
      },
    })

    expect(traffic instanceof AnalyticsError && traffic.kind).toBe("invalid-credentials")
    expect(urls).toHaveLength(1)
  })
})
