import { getPayload } from 'payload'
import React from 'react'
import type { Metadata } from 'next'

import config from '@/payload.config'
import '../styles.css'

export const metadata: Metadata = {
  title: 'よくある質問',
}

export default async function FaqPage() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const result = await payload.find({
    collection: 'faq',
    limit: 100,
    sort: 'order',
  })

  return (
    <div className="max-w-prose mx-auto px-6 py-section-sm md:py-section">
      <h1 className="text-3xl font-bold mb-8">よくある質問</h1>
      {result.docs.length === 0 ? (
        <p className="text-muted">まだ質問がありません。</p>
      ) : (
        <dl className="space-y-8">
          {result.docs.map((item) => (
            <div key={item.id}>
              <dt className="mb-2 text-lg font-semibold">Q. {item.question}</dt>
              <dd className="whitespace-pre-wrap leading-relaxed">A. {item.answer}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  )
}
