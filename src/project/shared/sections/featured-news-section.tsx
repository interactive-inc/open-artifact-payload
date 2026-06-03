import Link from 'next/link'
import React from 'react'
import { ArrowRightIcon } from 'lucide-react'

import { Badge } from '@/project/shared/ui/badge'
import { Button } from '@/project/shared/ui/button'
import type { News } from '@/payload-types'

const categoryLabel: Record<string, string> = {
  info: 'お知らせ',
  press: 'プレスリリース',
  event: 'イベント',
}

type Props = {
  data: {
    enabled?: boolean | null
    heading?: string | null
    items?: (number | News)[] | null
  }
}

// Stripe 風の軽量カード。影でなく境界線とホバーで階層を出す。
export function FeaturedNewsSection(props: Props) {
  if (!props.data.enabled) return null
  const items = (props.data.items ?? []).filter(
    (item): item is News => typeof item === 'object' && item !== null,
  )

  if (items.length === 0) return null

  return (
    <section className="py-24 bg-muted/40">
      <div className="container-site">
        <div className="flex items-end justify-between mb-12">
          <h2 className="text-3xl md:text-4xl font-heading font-semibold tracking-tight">
            {props.data.heading ?? '最新のお知らせ'}
          </h2>
          <Button nativeButton={false} render={<Link href="/news" />} variant="ghost" size="sm">
            一覧を見る
            <ArrowRightIcon data-icon="inline-end" />
          </Button>
        </div>
        <div className="grid gap-px overflow-hidden bg-border ring-1 ring-border md:grid-cols-3">
          {items.map((item) => {
            const publishedDate = new Date(item.publishedAt)

            return (
              <Link
                key={item.id}
                href={`/news/${item.slug}`}
                className="group flex flex-col gap-3 bg-card p-7 transition-colors hover:bg-accent/40"
              >
                <div className="flex items-center gap-3">
                  {item.category ? (
                    <Badge variant="secondary">
                      {categoryLabel[item.category] ?? item.category}
                    </Badge>
                  ) : null}
                  <time
                    dateTime={publishedDate.toISOString().slice(0, 10)}
                    className="text-xs text-muted-foreground tabular-nums"
                  >
                    {publishedDate.toLocaleDateString('ja-JP')}
                  </time>
                </div>
                <p className="font-medium leading-snug group-hover:text-primary transition-colors">
                  {item.title}
                </p>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
