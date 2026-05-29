import Link from 'next/link'
import React from 'react'

import type { News } from '@/payload-types'

type Props = {
  data: {
    enabled?: boolean | null
    heading?: string | null
    items?: (number | News)[] | null
  }
}

export function FeaturedNewsSection(props: Props) {
  if (!props.data.enabled) return null
  const items = (props.data.items ?? []).filter(
    (item): item is News => typeof item === 'object' && item !== null,
  )
  if (items.length === 0) return null

  return (
    <section className="py-16">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-2xl font-bold mb-6">{props.data.heading ?? '最新のお知らせ'}</h2>
        <ul className="grid gap-6 md:grid-cols-3">
          {items.map((item) => {
            const publishedDate = new Date(item.publishedAt)
            return (
              <li key={item.id} className="border border-gray-200 rounded-lg p-6">
                <Link href={`/news/${item.slug}`}>
                  <h3 className="font-semibold text-lg">{item.title}</h3>
                  <time
                    dateTime={publishedDate.toISOString().slice(0, 10)}
                    className="text-sm text-gray-500"
                  >
                    {publishedDate.toLocaleDateString('ja-JP')}
                  </time>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
