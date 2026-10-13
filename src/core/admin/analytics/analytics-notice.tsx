import Link from "next/link"
import React from "react"

import type { AnalyticsTrafficState } from "@/core/lib/analytics/analytics-traffic-state"
import { formatJstDateTime } from "@/core/lib/analytics/format-jst-date-time"
import { getAnalyticsErrorMessage } from "@/core/lib/analytics/get-analytics-error-message"

type Props = {
  trafficState: AnalyticsTrafficState
  settingsHref: string | null
}

/** 未接続・取得失敗のときの説明。問題が無ければ何も出さない。 */
export function AnalyticsNotice(props: Props) {
  const state = props.trafficState

  if (state.status === "ready") return null

  if (state.status === "not-configured") {
    return (
      <div className="ictms-analytics__notice">
        <p>GA4 が未接続です。問い合わせ件数だけを表示しています。</p>
        {props.settingsHref ? <Link href={props.settingsHref}>アクセス解析設定を開く</Link> : null}
      </div>
    )
  }

  const message = getAnalyticsErrorMessage(state.errorKind)

  return (
    <div className="ictms-analytics__notice ictms-analytics__notice--error" role="status">
      <p>
        {state.status === "stale"
          ? `最新の取得に失敗しました（前回取得: ${formatJstDateTime(state.traffic.fetchedAt)}）。${message}`
          : message}
      </p>
    </div>
  )
}
