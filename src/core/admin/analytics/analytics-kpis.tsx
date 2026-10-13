import React from "react"

import { AnalyticsKpiTile } from "@/core/admin/analytics/analytics-kpi-tile"
import { toChangeTone } from "@/core/admin/analytics/to-change-tone"
import type { AnalyticsTraffic } from "@/core/lib/analytics/analytics-traffic-schema"
import { calculateChangeRate } from "@/core/lib/analytics/calculate-change-rate"
import { formatChangeRate } from "@/core/lib/analytics/format-change-rate"
import { formatCountChange } from "@/core/lib/analytics/format-count-change"
import type { InquiryCounts } from "@/core/lib/analytics/inquiry-counts"

type Props = {
  traffic: AnalyticsTraffic | null
  inquiries: InquiryCounts | null
}

const METRICS = [
  { key: "activeUsers", label: "ユーザー" },
  { key: "screenPageViews", label: "表示回数" },
  { key: "sessions", label: "セッション" },
] as const

/** ユーザー・表示回数・セッション・問い合わせの4つの数字。GA4 が無ければ問い合わせだけ。 */
export function AnalyticsKpis(props: Props) {
  const traffic = props.traffic

  return (
    <dl className="ictms-analytics__kpis">
      {traffic
        ? METRICS.map((metric) => {
            const rate = calculateChangeRate({
              current: traffic.totals.current[metric.key],
              previous: traffic.totals.previous[metric.key],
            })
            return (
              <AnalyticsKpiTile
                key={metric.key}
                label={metric.label}
                value={traffic.totals.current[metric.key].toLocaleString("ja-JP")}
                change={formatChangeRate(rate)}
                tone={toChangeTone(rate)}
              />
            )
          })
        : null}
      {props.inquiries ? (
        <AnalyticsKpiTile
          label="問い合わせ"
          value={`${props.inquiries.currentTotal.toLocaleString("ja-JP")}件`}
          change={formatCountChange({
            current: props.inquiries.currentTotal,
            previous: props.inquiries.previousTotal,
          })}
          tone={toChangeTone(props.inquiries.currentTotal - props.inquiries.previousTotal)}
        />
      ) : null}
    </dl>
  )
}
