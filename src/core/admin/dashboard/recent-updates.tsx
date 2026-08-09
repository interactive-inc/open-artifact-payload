import Link from "next/link"
import React from "react"

import type { News } from "@/payload-types"
import { formatNewsDate } from "@/core/lib/format-news-date"

type Props = {
  items: News[]
}

export function RecentUpdates(props: Props) {
  if (props.items.length === 0) {
    return (
      <section className="ictms-dashboard__recent">
        <h2 className="ictms-dashboard__section-title">最近の更新</h2>
        <p className="ictms-dashboard__recent-empty">まだ更新履歴がありません</p>
      </section>
    )
  }

  return (
    <section className="ictms-dashboard__recent">
      <h2 className="ictms-dashboard__section-title">最近の更新</h2>
      <ul className="ictms-dashboard__recent-list">
        {props.items.map((item) => {
          const updatedAt = formatNewsDate(item.updatedAt, "ja")
          return (
            <li key={item.id} className="ictms-dashboard__recent-item">
              <Link href={`/admin/collections/news/${item.id}`}>
                {updatedAt ? (
                  <span className="ictms-dashboard__recent-date">{updatedAt.label}</span>
                ) : null}
                <span className="ictms-dashboard__recent-title">{item.title}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
