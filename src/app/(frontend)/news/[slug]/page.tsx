import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getPayload } from 'payload'
import React from 'react'

import config from '@/payload.config'
import { LexicalRenderer } from '@/core/lib/lexical'
import '../../styles.css'

const categoryLabel: Record<string, string> = {
  info: 'お知らせ',
  press: 'プレスリリース',
  event: 'イベント',
}

type Props = {
  params: Promise<{ slug: string }>
}

export default async function NewsDetailPage(props: Props) {
  const params = await props.params
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const draftState = await draftMode()
  const isDraft = draftState.isEnabled
  const result = await payload.find({
    collection: 'news',
    where: { slug: { equals: params.slug } },
    limit: 1,
    draft: isDraft,
  })

  const item = result.docs[0]
  if (!item) {
    notFound()
  }

  const publishedDate = new Date(item.publishedAt)

  return (
    <div>
      <section className="bg-gray-50 py-10">
        <div className="max-w-4xl mx-auto px-6">
          <nav className="text-sm text-gray-500 mb-4">
            <Link href="/" className="hover:text-brand">ホーム</Link>
            <span className="mx-2">/</span>
            <Link href="/news" className="hover:text-brand">お知らせ</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-700">{item.title}</span>
          </nav>
        </div>
      </section>

      <article className="max-w-4xl mx-auto px-6 py-12">
        <header className="mb-10 pb-8 border-b border-gray-200">
          {item.category ? (
            <span className="inline-block text-xs font-medium text-brand bg-brand/10 px-2 py-0.5 rounded mb-3">
              {categoryLabel[item.category] ?? item.category}
            </span>
          ) : null}
          <h1 className="text-3xl font-bold text-gray-900 leading-tight mb-4">{item.title}</h1>
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
        </header>
        <div className="prose max-w-none">
          <LexicalRenderer value={item.body} />
        </div>
        <div className="mt-12 pt-8 border-t border-gray-200">
          <Link
            href="/news"
            className="inline-flex items-center gap-2 text-brand font-medium hover:underline"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            お知らせ一覧へ戻る
          </Link>
        </div>
      </article>
    </div>
  )
}
