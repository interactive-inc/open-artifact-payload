import type { Payload } from "payload"
import React from "react"

import { AnalyticsPanelView } from "@/core/admin/analytics/analytics-panel-view"
import { hasAdminRole } from "@/core/lib/access/has-admin-role"
import type { AnalyticsRange } from "@/core/lib/analytics/analytics-range"
import { loadAnalyticsDashboard } from "@/core/lib/analytics/load-analytics-dashboard"

type Props = {
  payload: Payload
  user: unknown
  range: AnalyticsRange
}

/**
 * ダッシュボードのアクセス解析パネル。見られないロールには何も出さない。
 * サーバー専用の描画なので new Date() を使ってもハイドレーション不整合は起きない。
 */
export async function AnalyticsPanel(props: Props) {
  const dashboard = await loadAnalyticsDashboard({
    payload: props.payload,
    user: props.user,
    range: props.range,
    now: new Date(),
    fetcher: fetch,
    serviceAccountJson: process.env.GA4_SERVICE_ACCOUNT_JSON,
  })

  if (dashboard === null) return null

  if (dashboard instanceof Error) {
    props.payload.logger.error({
      msg: "アクセス解析を読み込めませんでした",
      err: dashboard.message,
    })

    return null
  }

  return (
    <AnalyticsPanelView
      range={props.range}
      period={dashboard.period}
      trafficState={dashboard.trafficState}
      inquiries={dashboard.inquiries}
      settingsHref={
        hasAdminRole(props.user)
          ? `${props.payload.config.routes.admin}/globals/analytics-settings`
          : null
      }
    />
  )
}
