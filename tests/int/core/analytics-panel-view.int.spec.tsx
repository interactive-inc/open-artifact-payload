/**
 * @vitest-environment jsdom
 */
import { render } from "@testing-library/react"
import React from "react"
import { beforeAll, describe, expect, it } from "vite-plus/test"

import { AnalyticsPanelView } from "@/core/admin/analytics/analytics-panel-view"
import {
  exampleAnalyticsPeriod,
  exampleAnalyticsTraffic,
  exampleInquiryCounts,
} from "@/core/test-support/example-analytics-traffic"

const settingsHref = "/admin/globals/analytics-settings"

describe("AnalyticsPanelView", () => {
  beforeAll(() => {
    // recharts の ResponsiveContainer は jsdom に無い ResizeObserver を使う
    globalThis.ResizeObserver ??= class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  })

  it("4つの数字と前の期間からの増減を出す", () => {
    const { getByText } = render(
      <AnalyticsPanelView
        range="28d"
        period={exampleAnalyticsPeriod}
        trafficState={{ status: "ready", traffic: exampleAnalyticsTraffic }}
        inquiries={exampleInquiryCounts}
        settingsHref={settingsHref}
      />,
    )

    expect(getByText("1,284")).toBeTruthy()
    expect(getByText("▲12%")).toBeTruthy()
    expect(getByText("▼3%")).toBeTruthy()
    expect(getByText("9件")).toBeTruthy()
    expect(getByText("▲2件")).toBeTruthy()
  })

  it("人気ページと流入元、期間と取得時刻を出す", () => {
    const { getByText } = render(
      <AnalyticsPanelView
        range="28d"
        period={exampleAnalyticsPeriod}
        trafficState={{ status: "ready", traffic: exampleAnalyticsTraffic }}
        inquiries={exampleInquiryCounts}
        settingsHref={null}
      />,
    )

    expect(getByText("/works/brand-renewal")).toBeTruthy()
    expect(getByText("自然検索")).toBeTruthy()
    expect(getByText(/昨日までの28日間/)).toBeTruthy()
    expect(getByText(/10\/14 10:12 取得/)).toBeTruthy()
  })

  it("期間の切り替えは URL パラメータのリンクで、今の期間を示す", () => {
    const { getByRole } = render(
      <AnalyticsPanelView
        range="7d"
        period={exampleAnalyticsPeriod}
        trafficState={{ status: "not-configured" }}
        inquiries={exampleInquiryCounts}
        settingsHref={null}
      />,
    )

    expect(getByRole("link", { name: "28日" }).getAttribute("href")).toBe("?range=28d")
    expect(getByRole("link", { name: "7日" }).getAttribute("aria-current")).toBe("true")
  })

  it("未接続なら問い合わせ件数だけ出し、設定できる人には設定画面へのリンクを出す", () => {
    const { getByText, queryByText, getByRole } = render(
      <AnalyticsPanelView
        range="28d"
        period={exampleAnalyticsPeriod}
        trafficState={{ status: "not-configured" }}
        inquiries={exampleInquiryCounts}
        settingsHref={settingsHref}
      />,
    )

    expect(getByText(/GA4 が未接続です/)).toBeTruthy()
    expect(getByText("9件")).toBeTruthy()
    expect(queryByText("ユーザー")).toBeNull()
    expect(getByRole("link", { name: "アクセス解析設定を開く" }).getAttribute("href")).toBe(
      settingsHref,
    )
  })

  it("設定できない人には設定画面へのリンクを出さない", () => {
    const { queryByRole } = render(
      <AnalyticsPanelView
        range="28d"
        period={exampleAnalyticsPeriod}
        trafficState={{ status: "not-configured" }}
        inquiries={exampleInquiryCounts}
        settingsHref={null}
      />,
    )

    expect(queryByRole("link", { name: "アクセス解析設定を開く" })).toBeNull()
  })

  it("前回の結果を出すときは、取得に失敗したことと対処を添える", () => {
    const { getByText } = render(
      <AnalyticsPanelView
        range="28d"
        period={exampleAnalyticsPeriod}
        trafficState={{
          status: "stale",
          traffic: exampleAnalyticsTraffic,
          errorKind: "unauthorized",
        }}
        inquiries={exampleInquiryCounts}
        settingsHref={null}
      />,
    )

    expect(getByText(/最新の取得に失敗しました（前回取得: 10\/14 10:12）/)).toBeTruthy()
    expect(getByText(/閲覧者として追加されているか/)).toBeTruthy()
    expect(getByText("1,284")).toBeTruthy()
  })

  it("取得に失敗して前回の結果も無ければ、原因に応じた対処だけを出す", () => {
    const { getByText, queryByText } = render(
      <AnalyticsPanelView
        range="28d"
        period={exampleAnalyticsPeriod}
        trafficState={{ status: "failed", errorKind: "rate-limited" }}
        inquiries={exampleInquiryCounts}
        settingsHref={null}
      />,
    )

    expect(getByText(/呼び出し上限に達しました/)).toBeTruthy()
    expect(queryByText("人気ページ")).toBeNull()
  })

  it("前の期間が0なら増減はダッシュ", () => {
    const traffic = {
      ...exampleAnalyticsTraffic,
      totals: {
        current: exampleAnalyticsTraffic.totals.current,
        previous: { activeUsers: 0, screenPageViews: 0, sessions: 0 },
      },
    }

    const { getAllByText } = render(
      <AnalyticsPanelView
        range="28d"
        period={exampleAnalyticsPeriod}
        trafficState={{ status: "ready", traffic }}
        inquiries={null}
        settingsHref={null}
      />,
    )

    expect(getAllByText("—")).toHaveLength(3)
  })

  it("グラフの数値は表としても読み上げられる", () => {
    const { getByRole } = render(
      <AnalyticsPanelView
        range="28d"
        period={exampleAnalyticsPeriod}
        trafficState={{ status: "ready", traffic: exampleAnalyticsTraffic }}
        inquiries={exampleInquiryCounts}
        settingsHref={null}
      />,
    )

    expect(getByRole("table", { name: "日ごとのユーザー数" })).toBeTruthy()
  })
})
