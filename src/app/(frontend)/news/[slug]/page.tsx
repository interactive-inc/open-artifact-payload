import { cache } from 'react'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import React from 'react'
import type { Metadata } from 'next'

import config from '@/payload.config'
import { RichText } from '@/core/lib/lexical'
import { formatNewsDate } from '@/core/lib/format-news-date'
import { buildMetadata } from '@/core/lib/build-metadata'
import '../../styles.css'

type Props = {
  params: Promise<{ slug: string }>
}

// generateMetadata と本体で同一クエリを共有するため React.cache で memo 化する。
const loadNewsBySlug = cache(async (slug: string, isDraft: boolean) => {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  // 公開フロントでは下書きを除外。ライブプレビュー時のみ下書きも対象。
  // collection の access 制御 (publishedOrAuthenticated) でも防御しているが、
  // クエリ側でも明示することで意図を明確にする。
  const conditions: Record<string, { equals: string }>[] = [{ slug: { equals: slug } }]
  if (!isDraft) conditions.push({ _status: { equals: 'published' } })
  const result = await payload.find({
    collection: 'news',
    where: { and: conditions },
    limit: 1,
    depth: 1,
    draft: isDraft,
  })
  return result.docs[0] ?? null
})

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const draftState = await draftMode()
  const item = await loadNewsBySlug(params.slug, draftState.isEnabled)
  if (!item) return {}
  return buildMetadata({ meta: item.meta, fallbackTitle: item.title })
}

export default async function NewsDetailPage(props: Props) {
  const params = await props.params
  const draftState = await draftMode()
  const item = await loadNewsBySlug(params.slug, draftState.isEnabled)
  if (!item) {
    notFound()
  }

  const publishedDate = formatNewsDate(item.publishedAt)

  return (
    <article className="max-w-prose mx-auto px-6 py-section-sm md:py-section">
      <header className="mb-8">
        {publishedDate ? (
          <time dateTime={publishedDate.dateTime} className="text-sm text-muted">
            {publishedDate.label}
          </time>
        ) : null}
        <h1 className="text-4xl font-bold mt-2">{item.title}</h1>
      </header>
      <RichText data={item.body} />
    </article>
  )
}
