import Link from 'next/link'
import { draftMode } from 'next/headers'
import { getPayload } from 'payload'
import React from 'react'

import config from '@/payload.config'
import '../styles.css'

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
      <section className="bg-brand py-16 text-white">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold">お知らせ</h1>
          <p className="mt-4 text-lg opacity-90">最新情報・プレスリリース</p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6">
          {result.docs.length === 0 ? (
            <p className="text-center text-gray-500 py-16">まだ投稿がありません。</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {result.docs.map((item) => {
                const publishedDate = new Date(item.publishedAt)
                return (
                  <li key={item.id}>
                    <Link href={`/news/${item.slug}`} className="flex gap-6 py-6 hover:bg-gray-50 -mx-4 px-4 rounded-lg transition-colors">
                      <time
                        dateTime={publishedDate.toISOString().slice(0, 10)}
                        className="text-sm text-gray-500 whitespace-nowrap pt-1 w-24 flex-shrink-0"
                      >
                        {publishedDate.toLocaleDateString('ja-JP', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                        })}
                      </time>
                      <div>
                        {item.category ? (
                          <span className="inline-block text-xs font-medium text-brand bg-brand/10 px-2 py-0.5 rounded mb-2">
                            {categoryLabel[item.category] ?? item.category}
                          </span>
                        ) : null}
                        <h2 className="text-base font-medium text-gray-900 hover:text-brand leading-snug">
                          {item.title}
                        </h2>
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
