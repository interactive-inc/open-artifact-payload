import React from "react"

import type { AnalyticsTraffic } from "@/core/lib/analytics/analytics-traffic-schema"

type Props = {
  pages: AnalyticsTraffic["topPages"]
}

/** よく見られたページの上位。パスはクエリを含まない。 */
export function AnalyticsTopPages(props: Props) {
  return (
    <section className="ictms-analytics__box">
      <h3 className="ictms-analytics__box-title">人気ページ</h3>
      {props.pages.length === 0 ? (
        <p className="ictms-analytics__empty">この期間の表示はありません</p>
      ) : (
        <ol className="ictms-analytics__pages">
          {props.pages.map((page) => (
            <li key={page.path} className="ictms-analytics__page">
              <span className="ictms-analytics__page-path">{page.path}</span>
              <span className="ictms-analytics__page-count">
                {page.screenPageViews.toLocaleString("ja-JP")}
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
