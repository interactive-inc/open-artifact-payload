import Link from 'next/link'
import React from 'react'
import { ArrowRightIcon } from 'lucide-react'

import { Card, CardContent, CardHeader } from '@/project/shared/ui/card'
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

export function FeaturedNewsSection(props: Props) {
  if (!props.data.enabled) return null
  const items = (props.data.items ?? []).filter(
    (item): item is News => typeof item === 'object' && item !== null,
  )
  if (items.length === 0) return null

  return (
    <section className="py-16 bg-muted/30">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold tracking-tight">
            {props.data.heading ?? '最新のお知らせ'}
          </h2>
          <Button asChild variant="ghost" size="sm">
            <Link href="/news">
              一覧を見る
              <ArrowRightIcon data-icon="inline-end" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {items.map((item) => {
            const publishedDate = new Date(item.publishedAt)
            return (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 mb-2">
                    {item.category ? (
                      <Badge variant="secondary">
                        {categoryLabel[item.category] ?? item.category}
                      </Badge>
                    ) : null}
                    <time
                      dateTime={publishedDate.toISOString().slice(0, 10)}
                      className="text-xs text-muted-foreground"
                    >
                      {publishedDate.toLocaleDateString('ja-JP')}
                    </time>
                  </div>
                </CardHeader>
                <CardContent>
                  <Link href={`/news/${item.slug}`} className="hover:underline">
                    <p className="font-medium leading-snug">{item.title}</p>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
