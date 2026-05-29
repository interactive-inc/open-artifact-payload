import Link from 'next/link'
import { draftMode } from 'next/headers'
import { getPayload } from 'payload'
import React from 'react'

import config from '@/payload.config'
import '../styles.css'

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
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold mb-8">お知らせ</h1>
      {result.docs.length === 0 ? (
        <p className="text-gray-500">まだ投稿がありません。</p>
      ) : (
        <ul className="space-y-6">
          {result.docs.map((item) => {
            const publishedDate = new Date(item.publishedAt)
            return (
              <li key={item.id} className="border-b border-gray-200 pb-6">
                <Link href={`/news/${item.slug}`} className="block">
                  <time
                    dateTime={publishedDate.toISOString().slice(0, 10)}
                    className="text-sm text-gray-500"
                  >
                    {publishedDate.toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </time>
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
