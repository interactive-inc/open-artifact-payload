import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import React from 'react'

import config from '@/payload.config'
import { LexicalRenderer } from '@/core/lib/lexical'
import '../../styles.css'

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
    <article className="max-w-3xl mx-auto px-6 py-16">
      <header className="mb-8">
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
        <h1 className="text-4xl font-bold mt-2">{item.title}</h1>
      </header>
      <div className="prose">
        <LexicalRenderer value={item.body} />
      </div>
    </article>
  )
}
