import { describe, expect, it } from "vite-plus/test"

import { AnalyticsError } from "@/core/lib/analytics/analytics-error"
import { fetchGa4BatchReports } from "@/core/lib/analytics/fetch-ga4-batch-reports"

const body = { requests: [] }

const validResponse = { kind: "analyticsData#batchRunReports", reports: [{}, {}, {}, {}] }

const respondWith = (status: number, text: string) => async () => new Response(text, { status })

const fetchWith = (fetcher: typeof fetch) =>
  fetchGa4BatchReports({ propertyId: "123456789", accessToken: "ya29.token", body, fetcher })

describe("fetchGa4BatchReports", () => {
  it("プロパティの batchRunReports にアクセストークン付きで POST する", async () => {
    const requests: Request[] = []

    const response = await fetchWith(async (input, init) => {
      requests.push(new Request(input, init))
      return Response.json(validResponse)
    })

    expect(response).not.toBeInstanceOf(Error)
    expect(requests[0]?.method).toBe("POST")
    expect(requests[0]?.url).toBe(
      "https://analyticsdata.googleapis.com/v1beta/properties/123456789:batchRunReports",
    )
    expect(requests[0]?.headers.get("authorization")).toBe("Bearer ya29.token")
    expect(await requests[0]?.json()).toEqual(body)
  })

  it("401 と 403 は権限不足", async () => {
    const unauthorized = await fetchWith(respondWith(401, "{}"))
    const forbidden = await fetchWith(respondWith(403, "{}"))

    expect(unauthorized instanceof AnalyticsError && unauthorized.kind).toBe("unauthorized")
    expect(forbidden instanceof AnalyticsError && forbidden.kind).toBe("unauthorized")
  })

  it("400 と 404 はプロパティ ID などを受け付けなかったものとする", async () => {
    const badRequest = await fetchWith(respondWith(400, "{}"))
    const notFound = await fetchWith(respondWith(404, "{}"))

    expect(badRequest instanceof AnalyticsError && badRequest.kind).toBe("rejected")
    expect(notFound instanceof AnalyticsError && notFound.kind).toBe("rejected")
  })

  it("429 は呼び出し上限、5xx は応答なし", async () => {
    const limited = await fetchWith(respondWith(429, "{}"))
    const unavailable = await fetchWith(respondWith(503, "{}"))

    expect(limited instanceof AnalyticsError && limited.kind).toBe("rate-limited")
    expect(unavailable instanceof AnalyticsError && unavailable.kind).toBe("unavailable")
  })

  it("応答本文はエラーメッセージに含めない", async () => {
    const forbidden = await fetchWith(respondWith(403, "property 999 detail secret-detail"))

    expect(forbidden instanceof Error && forbidden.message).not.toContain("secret-detail")
  })

  it("想定外の形や JSON でない応答は形式エラー", async () => {
    const wrongShape = await fetchWith(async () => Response.json({ reports: [{}] }))
    const notJson = await fetchWith(respondWith(200, "<html>"))

    expect(wrongShape instanceof AnalyticsError && wrongShape.kind).toBe("invalid-response")
    expect(notJson instanceof AnalyticsError && notJson.kind).toBe("invalid-response")
  })

  it("打ち切りや通信失敗は応答なし", async () => {
    const timedOut = await fetchWith(async () => {
      throw new DOMException("The operation timed out.", "TimeoutError")
    })

    expect(timedOut instanceof AnalyticsError && timedOut.kind).toBe("unavailable")
  })
})
