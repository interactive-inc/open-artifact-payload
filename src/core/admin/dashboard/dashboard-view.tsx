import { getPayload, type AdminViewServerProps } from "payload"
import React, { Suspense } from "react"

import config from "@/payload.config"
import { dashboardTasks } from "@/cms/admin/dashboard-tasks"
import { AnalyticsPanel } from "@/core/admin/analytics/analytics-panel"
import { AnalyticsPanelSkeleton } from "@/core/admin/analytics/analytics-panel-skeleton"
import { loadCanViewAnalytics } from "@/core/lib/analytics/load-can-view-analytics"
import { parseAnalyticsRange } from "@/core/lib/analytics/parse-analytics-range"
import { HelpLink } from "./help-link"
import { RecentUpdates } from "./recent-updates"
import { TaskCard } from "./task-card"
import "./dashboard-view.css"

const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL ?? "support@yourcompany.jp"

export const DashboardView = async (props: AdminViewServerProps) => {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const recent = await payload.find({
    collection: "news",
    limit: 5,
    sort: "-updatedAt",
  })
  const primary = dashboardTasks.filter((task) => task.priority === "primary")
  const secondary = dashboardTasks.filter((task) => task.priority !== "primary")
  // enableAnalytics の案件だけ設定 Global が登録される。core から案件のフラグ値は読まない
  const hasAnalytics = payloadConfig.globals.some((global) => global.slug === "analytics-settings")
  const user = props.initPageResult.req.user
  const showsAnalytics = hasAnalytics && (await loadCanViewAnalytics({ payload, user }))
  const range = parseAnalyticsRange(props.searchParams?.range)

  return (
    <div className="ictms-dashboard">
      <header className="ictms-dashboard__hero">
        <h1>今日は何をしますか?</h1>
        <p>よく使う作業はこちらから始められます</p>
      </header>
      {primary.length > 0 ? (
        <section className="ictms-dashboard__primary">
          {primary.map((task) => (
            <TaskCard key={task.id} task={task} size="large" />
          ))}
        </section>
      ) : null}
      {secondary.length > 0 ? (
        <section className="ictms-dashboard__secondary">
          {secondary.map((task) => (
            <TaskCard key={task.id} task={task} size="small" />
          ))}
        </section>
      ) : null}
      {showsAnalytics ? (
        // 期間を切り替えたら読み込み中の表示に戻し、前の期間の数字を出したままにしない
        <Suspense key={range} fallback={<AnalyticsPanelSkeleton />}>
          <AnalyticsPanel payload={payload} user={user} range={range} />
        </Suspense>
      ) : null}
      <RecentUpdates items={recent.docs} />
      <HelpLink email={SUPPORT_EMAIL} />
    </div>
  )
}
