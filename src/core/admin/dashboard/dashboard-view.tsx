import { getPayload } from "payload"
import React from "react"

import config from "@/payload.config"
import { dashboardTasks } from "@/project/admin/dashboard-tasks"
import { HelpLink } from "./help-link"
import { RecentUpdates } from "./recent-updates"
import { TaskCard } from "./task-card"
import "./dashboard-view.css"

const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL ?? "support@yourcompany.jp"

export const DashboardView = async () => {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const recent = await payload.find({
    collection: "news",
    limit: 5,
    sort: "-updatedAt",
  })
  const primary = dashboardTasks.filter((task) => task.priority === "primary")
  const secondary = dashboardTasks.filter((task) => task.priority !== "primary")

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
      <RecentUpdates items={recent.docs} />
      <HelpLink email={SUPPORT_EMAIL} />
    </div>
  )
}
