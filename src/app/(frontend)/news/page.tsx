import Link from 'next/link'
import { draftMode } from 'next/headers'
import { getPayload } from 'payload'
import React from 'react'

import config from '@/payload.config'
import { formatNewsDate } from '@/core/lib/format-news-date'
import { Badge } from '@/project/shared/ui/badge'
import { Separator } from '@/project/shared/ui/separator'
import { PageHeader } from '@/project/shared/sections/page-header'
import type { Metadata } from 'next'

import '../styles.css'

export const metadata: Metadata = {
  title: 'お知らせ',
}

const categoryLabel: Record<string, string> = {
  info: 'お知らせ',
  press: 'プレスリリース',
  event: 'イベント',
}

export default async function NewsListPage() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const draftState = await draftMode()
  const isDraft = draftState.isEnabled
  // Payload は draft: false でも _status='draft' のレコードを返してしまうため、
  // 公開フロントでは where: { _status: 'published' } を明示する。
  // ライブプレビュー(isDraft=true)時はその制約を外し、下書きを含めて見せる。
  const result = await payload.find({
    collection: 'news',
    limit: 20,
    sort: '-publishedAt',
    draft: isDraft,
    where: isDraft ? undefined : { _status: { equals: 'published' } },
  })

  return (
    <div>
      <PageHeader title="お知らせ" description="最新情報・プレスリリース" />

      <section className="py-16">
        <div className="container-site">
          {result.docs.length === 0 ? (
            <p className="text-center text-muted-foreground py-16">まだ投稿がありません。</p>
          ) : (
            <ul>
              {result.docs.map((item, index) => {
                const publishedDate = formatNewsDate(item.publishedAt)
                return (
                  <li key={item.id}>
                    {index > 0 ? <Separator /> : null}
                    <Link
                      href={`/news/${item.slug}`}
                      className="flex gap-6 py-6 hover:bg-muted/50 -mx-4 px-4 rounded-lg transition-colors"
                    >
                      {publishedDate ? (
                        <time
                          dateTime={publishedDate.dateTime}
                          className="text-sm text-muted-foreground whitespace-nowrap pt-0.5 w-24 flex-shrink-0"
                        >
                          {publishedDate.label}
                        </time>
                      ) : null}
                      <div className="flex flex-col gap-2">
                        {item.category ? (
                          <Badge variant="secondary" className="w-fit">
                            {categoryLabel[item.category] ?? item.category}
                          </Badge>
                        ) : null}
                        <p className="text-sm font-medium leading-snug hover:underline">
                          {item.title}
                        </p>
                      </div>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </section>
    </div>
  )
}
