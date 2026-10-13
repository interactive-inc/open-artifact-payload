import { getPayload, type Payload } from "payload"
import { beforeAll, beforeEach, describe, expect, it, vi } from "vite-plus/test"

import config from "@/payload.config"
import { countDailyInquiries } from "@/core/lib/analytics/count-daily-inquiries"
import { getAnalyticsPeriod } from "@/core/lib/analytics/get-analytics-period"
import { loadAnalyticsTraffic } from "@/core/lib/analytics/load-analytics-traffic"
import { readAnalyticsStatus } from "@/core/lib/analytics/read-analytics-status"
import { writeAnalyticsKv } from "@/core/lib/analytics/write-analytics-kv"
import { createTestServiceAccount } from "@/core/test-support/create-test-service-account"

let payload: Payload
let serviceAccountJson: string

const now = new Date("2026-10-14T03:00:00Z")

const trafficKey = "analytics:traffic:123456789:7d"

const ga4Fetcher = (status: number) => async (input: RequestInfo | URL) => {
  if (new Request(input).url.startsWith("https://oauth2.googleapis.com/")) {
    return Response.json({ access_token: "ya29.token" })
  }
  if (status !== 200) return new Response("{}", { status })
  return Response.json({ reports: [{}, {}, {}, {}] })
}

const forbiddenFetcher = async () => {
  throw new Error("GA4 に問い合わせてはいけない")
}

const cachedTraffic = (fetchedAt: Date) => ({
  range: "7d",
  fetchedAt: fetchedAt.toISOString(),
  period: getAnalyticsPeriod({ range: "7d", now: fetchedAt }),
  dailyTrend: [],
  previousDailyTrend: [],
  totals: {
    current: { activeUsers: 42, screenPageViews: 100, sessions: 50 },
    previous: { activeUsers: 40, screenPageViews: 90, sessions: 45 },
  },
  topPages: [],
  channels: [],
})

const loadWith = (props: {
  fetcher: typeof fetch
  json: string | undefined
  propertyId: string | null
}) =>
  loadAnalyticsTraffic({
    payload,
    range: "7d",
    now,
    fetcher: props.fetcher,
    serviceAccountJson: props.json,
    propertyId: props.propertyId,
  })

const load = (fetcher: typeof fetch) =>
  loadWith({ fetcher, json: serviceAccountJson, propertyId: "123456789" })

describe("loadAnalyticsTraffic", () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
    serviceAccountJson = (await createTestServiceAccount()).json
  })

  beforeEach(async () => {
    await payload.kv.delete(trafficKey)
    await payload.kv.delete("analytics:status")
  })

  it("プロパティ ID が無ければ GA4 に問い合わせず未接続", async () => {
    expect(
      await loadWith({ fetcher: forbiddenFetcher, json: serviceAccountJson, propertyId: null }),
    ).toEqual({ status: "not-configured" })
  })

  it("鍵が無ければ GA4 に問い合わせず未接続", async () => {
    expect(
      await loadWith({ fetcher: forbiddenFetcher, json: undefined, propertyId: "123456789" }),
    ).toEqual({ status: "not-configured" })
  })

  it("3時間以内の保存があれば GA4 に問い合わせずに使う", async () => {
    await writeAnalyticsKv({
      payload,
      key: trafficKey,
      value: cachedTraffic(new Date("2026-10-14T01:00:00Z")),
    })

    const state = await load(forbiddenFetcher)

    expect(state.status).toBe("ready")
    expect("traffic" in state && state.traffic.totals.current.activeUsers).toBe(42)
  })

  it("保存が無ければ取得して保存し、成功を記録する", async () => {
    const state = await load(ga4Fetcher(200))

    expect(state.status).toBe("ready")
    expect(await payload.kv.get(trafficKey)).toMatchObject({ range: "7d" })
    const status = await readAnalyticsStatus(payload)
    expect(status).toMatchObject({ lastSuccessAt: now.toISOString(), lastFailureKind: null })
  })

  it("古い保存があって取得に失敗したら、古い結果に失敗の種類を添えて返す", async () => {
    await writeAnalyticsKv({
      payload,
      key: trafficKey,
      value: cachedTraffic(new Date("2026-10-13T20:00:00Z")),
    })

    const state = await load(ga4Fetcher(403))

    expect(state.status).toBe("stale")
    expect("errorKind" in state && state.errorKind).toBe("unauthorized")
    expect(await readAnalyticsStatus(payload)).toMatchObject({
      lastFailureAt: now.toISOString(),
      lastFailureKind: "unauthorized",
    })
  })

  it("取得の失敗は、鍵や応答本文を含まない種類と詳細だけをログに残す", async () => {
    const warn = vi.spyOn(payload.logger, "warn")

    await load(ga4Fetcher(404))

    expect(warn).toHaveBeenCalledWith(
      expect.objectContaining({ kind: "rejected", detail: "GA4 404" }),
    )
    warn.mockRestore()
  })

  it("保存も無く取得に失敗したら失敗を返す", async () => {
    expect(await load(ga4Fetcher(429))).toEqual({ status: "failed", errorKind: "rate-limited" })
  })

  it("形の壊れた保存は無いものとして取得し直す", async () => {
    await writeAnalyticsKv({
      payload,
      key: trafficKey,
      value: { range: "7d", fetchedAt: "壊れた値" },
    })

    const state = await load(ga4Fetcher(200))

    expect(state.status).toBe("ready")
  })
})

describe("writeAnalyticsKv", () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  it("新しいキーも既存のキーも保存して読み戻せる", async () => {
    const key = `analytics:test:${crypto.randomUUID()}`

    expect(await writeAnalyticsKv({ payload, key, value: { version: 1 } })).toBeNull()
    expect(await payload.kv.get(key)).toEqual({ version: 1 })

    expect(await writeAnalyticsKv({ payload, key, value: { version: 2 } })).toBeNull()
    expect(await payload.kv.get(key)).toEqual({ version: 2 })
  })
})

describe("countDailyInquiries", () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  const createSubmissionAt = async (createdAt: string) => {
    const submission = await payload.create({
      collection: "contact-submissions",
      data: {
        name: "集計テスト",
        email: "count@example.com",
        message: "件数の確認",
        status: "new",
      },
    })
    await payload.db.updateOne({
      collection: "contact-submissions",
      where: { id: { equals: submission.id } },
      data: { createdAt },
    })
  }

  it("問い合わせを日本時間の日ごとに数え、今と前の期間の合計を出す", async () => {
    const period = {
      days: 2,
      current: { startDate: "2030-01-03", endDate: "2030-01-04" },
      previous: { startDate: "2030-01-01", endDate: "2030-01-02" },
    }
    // 日本時間 2030-01-03 00:30（UTC では前日）
    await createSubmissionAt("2030-01-02T15:30:00.000Z")
    await createSubmissionAt("2030-01-04T10:00:00.000Z")
    await createSubmissionAt("2030-01-04T11:00:00.000Z")
    // 日本時間 2030-01-02 23:59（前の期間）
    await createSubmissionAt("2030-01-02T14:59:00.000Z")
    // 日本時間 2030-01-05 00:00（期間外）
    await createSubmissionAt("2030-01-04T15:00:00.000Z")

    const counts = await countDailyInquiries({ payload, period })

    expect(counts).toEqual({
      daily: [
        { date: "2030-01-03", count: 1 },
        { date: "2030-01-04", count: 2 },
      ],
      currentTotal: 3,
      previousTotal: 1,
    })
  })
})
