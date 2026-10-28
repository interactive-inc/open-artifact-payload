import React from "react"

import { AnalyticsChannels } from "@/core/admin/analytics/analytics-channels"
import { AnalyticsKpis } from "@/core/admin/analytics/analytics-kpis"
import { AnalyticsNotice } from "@/core/admin/analytics/analytics-notice"
import { AnalyticsRangeLinks } from "@/core/admin/analytics/analytics-range-links"
import { AnalyticsTopPages } from "@/core/admin/analytics/analytics-top-pages"
import { AnalyticsTrend } from "@/core/admin/analytics/analytics-trend"
import type { AnalyticsPeriod } from "@/core/lib/analytics/analytics-period"
import type { AnalyticsRange } from "@/core/lib/analytics/analytics-range"
import type { AnalyticsTrafficState } from "@/core/lib/analytics/analytics-traffic-state"
import { formatJstDateTime } from "@/core/lib/analytics/format-jst-date-time"
import { formatShortDate } from "@/core/lib/analytics/format-short-date"
import type { InquiryCounts } from "@/core/lib/analytics/inquiry-counts"
import "@/core/admin/analytics/analytics-panel.css"

type Props = {
  range: AnalyticsRange
  period: AnalyticsPeriod
  trafficState: AnalyticsTrafficState
  inquiries: InquiryCounts | null
  settingsHref: string | null
}

/** ダッシュボードのアクセス解析パネル。データの取得はせず、渡された状態を描くだけ。 */
export function AnalyticsPanelView(props: Props) {
  const traffic = "traffic" in props.trafficState ? props.trafficState.traffic : null

  const period = traffic?.period ?? props.period

  const span = `${formatShortDate(period.current.startDate)}〜${formatShortDate(period.current.endDate)}`

  return (
    <section className="ictms-analytics" aria-labelledby="ictms-analytics-title">
      <header className="ictms-analytics__header">
        <h2 id="ictms-analytics-title" className="ictms-dashboard__section-title">
          アクセス解析
        </h2>
        <AnalyticsRangeLinks range={props.range} />
      </header>
      <AnalyticsNotice trafficState={props.trafficState} settingsHref={props.settingsHref} />
      <AnalyticsKpis traffic={traffic} inquiries={props.inquiries} />
      {traffic ? <AnalyticsTrend traffic={traffic} /> : null}
      {traffic ? (
        <div className="ictms-analytics__columns">
          <AnalyticsTopPages pages={traffic.topPages} />
          <AnalyticsChannels channels={traffic.channels} />
        </div>
      ) : null}
      <p className="ictms-analytics__footer">
        {`昨日までの${period.days}日間（${span}）を前の${period.days}日間と比較`}
        {traffic ? `・${formatJstDateTime(traffic.fetchedAt)} 取得` : ""}
      </p>
    </section>
  )
}
