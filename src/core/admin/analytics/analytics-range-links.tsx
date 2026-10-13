import Link from "next/link"
import React from "react"

import {
  ANALYTICS_RANGE_DAYS,
  ANALYTICS_RANGES,
  type AnalyticsRange,
} from "@/core/lib/analytics/analytics-range"

type Props = {
  range: AnalyticsRange
}

/** 集計期間の切り替え。サーバーで描画し直すため URL パラメータのリンクにする。 */
export function AnalyticsRangeLinks(props: Props) {
  return (
    <nav className="ictms-analytics__ranges" aria-label="集計期間">
      {ANALYTICS_RANGES.map((range) => (
        <Link
          key={range}
          href={`?range=${range}`}
          className="ictms-analytics__range"
          aria-current={range === props.range ? "true" : undefined}
        >
          {ANALYTICS_RANGE_DAYS[range]}日
        </Link>
      ))}
    </nav>
  )
}
