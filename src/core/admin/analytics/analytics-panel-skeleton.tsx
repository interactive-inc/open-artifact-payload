import React from "react"

import "@/core/admin/analytics/analytics-panel.css"

/** GA4 の応答を待つ間の表示。ダッシュボードの他の部分は先に出る。 */
export function AnalyticsPanelSkeleton() {
  return (
    <section className="ictms-analytics" aria-busy="true" aria-labelledby="ictms-analytics-title">
      <header className="ictms-analytics__header">
        <h2 id="ictms-analytics-title" className="ictms-dashboard__section-title">
          アクセス解析
        </h2>
      </header>
      <p className="ictms-analytics__footer">集計を読み込んでいます…</p>
    </section>
  )
}
