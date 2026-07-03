import Link from 'next/link'
import React from 'react'

import type { News } from '@/payload-types'
import { formatNewsDate } from '@/core/lib/format-news-date'

type Props = {
  data: {
    enabled?: boolean | null
    heading?: string | null
    items?: (number | News)[] | null
  }
  // ライブプレビュー時 (draftMode) は下書きも表示する。デフォルトは false。
  showDrafts?: boolean
}

export function FeaturedNewsSection(props: Props) {
  if (!props.data.enabled) return null
  const items = (props.data.items ?? []).filter((item): item is News => {
    if (typeof item !== 'object' || item === null) return false
    // 公開フロントでは未公開ドラフトを除外。プレビューでは全て表示。
    if (!props.showDrafts && item._status !== 'published') return false
    return true
  })
  if (items.length === 0) return null

  return (
    <section className="py-section-sm md:py-section">
      <div className="max-w-container mx-auto px-6">
        <h2 className="text-2xl font-bold mb-6">{props.data.heading ?? '最新のお知らせ'}</h2>
        <ul className="grid gap-6 md:grid-cols-3">
          {items.map((item) => {
            const publishedDate = formatNewsDate(item.publishedAt, 'ja')
            return (
              <li key={item.id} className="border border-border rounded-lg p-6">
                <Link href={`/news/${item.slug}`}>
                  <h3 className="font-semibold text-lg">{item.title}</h3>
                  {publishedDate ? (
                    <time dateTime={publishedDate.dateTime} className="text-sm text-muted">
                      {publishedDate.label}
                    </time>
                  ) : null}
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
