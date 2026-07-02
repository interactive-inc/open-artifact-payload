import Link from 'next/link'
import { draftMode } from 'next/headers'
import { getPayload } from 'payload'
import React from 'react'

import config from '@/payload.config'
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
  const result = await payload.find({
    collection: 'news',
    limit: 20,
    sort: '-publishedAt',
    draft: isDraft,
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
                const publishedDate = new Date(item.publishedAt)
                return (
                  <li key={item.id}>
                    {index > 0 ? <Separator /> : null}
                    <Link
                      href={`/news/${item.slug}`}
                      className="flex gap-6 py-6 hover:bg-muted/50 -mx-4 px-4 rounded-lg transition-colors"
                    >
                      <time
                        dateTime={publishedDate.toISOString().slice(0, 10)}
                        className="text-sm text-muted-foreground whitespace-nowrap pt-0.5 w-24 flex-shrink-0"
                      >
                        {publishedDate.toLocaleDateString('ja-JP', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                        })}
                      </time>
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
