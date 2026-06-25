import Link from 'next/link'
import { draftMode } from 'next/headers'
import { getPayload } from 'payload'
import React from 'react'

import config from '@/payload.config'
import { formatNewsDate } from '@/core/lib/format-news-date'
import '../styles.css'

export const metadata = {
  title: 'お知らせ',
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
    <div className="max-w-wide mx-auto px-6 py-section-sm md:py-section">
      <h1 className="text-3xl font-bold mb-8">お知らせ</h1>
      {result.docs.length === 0 ? (
        <p className="text-muted">まだ投稿がありません。</p>
      ) : (
        <ul className="space-y-6">
          {result.docs.map((item) => {
            const publishedDate = formatNewsDate(item.publishedAt)
            return (
              <li key={item.id} className="border-b border-border pb-6">
                <Link href={`/news/${item.slug}`} className="block">
                  {publishedDate ? (
                    <time dateTime={publishedDate.dateTime} className="text-sm text-muted">
                      {publishedDate.label}
                    </time>
                  ) : null}
                  <h2 className="text-xl font-semibold mt-1">{item.title}</h2>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
