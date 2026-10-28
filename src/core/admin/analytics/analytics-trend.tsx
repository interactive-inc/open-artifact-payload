import React from "react"

import { AnalyticsTrendChart } from "@/core/admin/analytics/analytics-trend-chart"
import type { AnalyticsTraffic } from "@/core/lib/analytics/analytics-traffic-schema"
import { formatShortDate } from "@/core/lib/analytics/format-short-date"

type Props = {
  traffic: AnalyticsTraffic
}

/** 推移のグラフと、同じ数値を読み上げるための表。前の期間は同じ日目どうしで並べる。 */
export function AnalyticsTrend(props: Props) {
  const points = props.traffic.dailyTrend.map((point, index) => ({
    label: formatShortDate(point.date),
    current: point.activeUsers,
    previous: props.traffic.previousDailyTrend[index]?.activeUsers ?? 0,
  }))

  return (
    <figure className="ictms-analytics__chart">
      <figcaption className="ictms-analytics__legend">
        <span className="ictms-analytics__legend-current">今の期間のユーザー数</span>
        <span className="ictms-analytics__legend-previous">前の期間</span>
      </figcaption>
      <AnalyticsTrendChart points={points} />
      <table className="ictms-analytics__sr-only" aria-label="日ごとのユーザー数">
        <thead>
          <tr>
            <th scope="col">日付</th>
            <th scope="col">ユーザー数</th>
            <th scope="col">前の期間の同じ日目</th>
          </tr>
        </thead>
        <tbody>
          {points.map((point) => (
            <tr key={point.label}>
              <th scope="row">{point.label}</th>
              <td>{point.current}</td>
              <td>{point.previous}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
}
