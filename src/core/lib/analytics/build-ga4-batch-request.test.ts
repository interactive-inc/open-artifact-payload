import { describe, expect, it } from "vite-plus/test"

import { buildGa4BatchRequest } from "@/core/lib/analytics/build-ga4-batch-request"

const period = {
  days: 7,
  current: { startDate: "2026-10-07", endDate: "2026-10-13" },
  previous: { startDate: "2026-09-30", endDate: "2026-10-06" },
}

const namedRanges = [
  { name: "current", startDate: "2026-10-07", endDate: "2026-10-13" },
  { name: "previous", startDate: "2026-09-30", endDate: "2026-10-06" },
]

describe("buildGa4BatchRequest", () => {
  it("推移・合計・人気ページ・流入元の4種類を1回の呼び出しにまとめる", () => {
    expect(buildGa4BatchRequest(period).requests).toHaveLength(4)
  })

  it("推移は日ごとのユーザー数と表示回数を、今と前の期間の両方で聞く", () => {
    const trend = buildGa4BatchRequest(period).requests[0]

    expect(trend?.dimensions).toEqual([{ name: "date" }])
    expect(trend?.metrics).toEqual([{ name: "activeUsers" }, { name: "screenPageViews" }])
    expect(trend?.dateRanges).toEqual(namedRanges)
  })

  it("合計は次元なしで、今と前の期間の3指標を聞く", () => {
    const totals = buildGa4BatchRequest(period).requests[1]

    expect(totals?.dimensions).toEqual([])
    expect(totals?.metrics).toEqual([
      { name: "activeUsers" },
      { name: "screenPageViews" },
      { name: "sessions" },
    ])
    expect(totals?.dateRanges).toEqual(namedRanges)
  })

  it("人気ページはクエリを含まない pagePath の表示回数上位10件", () => {
    const pages = buildGa4BatchRequest(period).requests[2]

    expect(pages?.dimensions).toEqual([{ name: "pagePath" }])
    expect(pages?.limit).toBe("10")
    expect(pages?.orderBys).toEqual([{ metric: { metricName: "screenPageViews" }, desc: true }])
    expect(pages?.dateRanges).toEqual([namedRanges[0]])
  })

  it("流入元は標準のチャネルグループごとのセッション数を多い順に聞く", () => {
    const channels = buildGa4BatchRequest(period).requests[3]

    expect(channels?.dimensions).toEqual([{ name: "sessionDefaultChannelGroup" }])
    expect(channels?.metrics).toEqual([{ name: "sessions" }])
    expect(channels?.orderBys).toEqual([{ metric: { metricName: "sessions" }, desc: true }])
  })
})
