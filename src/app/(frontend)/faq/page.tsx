import { getPayload } from 'payload'
import Link from 'next/link'
import React from 'react'

import config from '@/payload.config'
import '../styles.css'

const categoryLabel: Record<string, string> = {
  general: '全般',
  service: 'サービス',
  pricing: '料金',
  other: 'その他',
}

export default async function FaqPage() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const result = await payload.find({
    collection: 'faq',
    limit: 100,
    sort: 'order',
  })

  const grouped: Record<string, typeof result.docs> = {}
  for (const item of result.docs) {
    const cat = item.category ?? 'general'
    if (!grouped[cat]) grouped[cat] = []
    grouped[cat].push(item)
  }

  return (
    <div>
      <section className="bg-brand py-16 text-white">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold">よくある質問</h1>
          <p className="mt-4 text-lg opacity-90">FAQ</p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6">
          {result.docs.length === 0 ? (
            <p className="text-center text-gray-500 py-16">FAQはまだありません。</p>
          ) : (
            <div className="space-y-12">
              {Object.entries(grouped).map(([category, items]) => (
                <div key={category}>
                  <h2 className="text-xl font-bold text-gray-900 mb-6 pb-2 border-b-2 border-brand">
                    {categoryLabel[category] ?? category}
                  </h2>
                  <div className="space-y-4">
                    {items.map((item) => (
                      <details
                        key={item.id}
                        className="group bg-white border border-gray-200 rounded-xl overflow-hidden"
                      >
                        <summary className="flex items-center justify-between gap-4 px-6 py-5 cursor-pointer list-none hover:bg-gray-50 transition-colors">
                          <div className="flex items-start gap-3">
                            <span className="text-brand font-bold text-lg mt-0.5 flex-shrink-0">Q</span>
                            <span className="font-medium text-gray-900">{item.question}</span>
                          </div>
                          <svg
                            className="w-5 h-5 text-gray-400 flex-shrink-0 transition-transform group-open:rotate-180"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </summary>
                        <div className="px-6 pb-5 pt-2">
                          <div className="flex gap-3">
                            <span className="text-accent font-bold text-lg flex-shrink-0">A</span>
                            <p className="text-gray-700 leading-relaxed">{item.answer}</p>
                          </div>
                        </div>
                      </details>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-12 text-center bg-gray-50 rounded-xl p-8">
            <p className="text-gray-700 mb-4">解決しない場合はお気軽にお問い合わせください</p>
            <Link
              href="/contact"
              className="inline-block px-6 py-3 bg-brand text-white font-semibold rounded-md hover:bg-brand-dark transition-colors"
            >
              お問い合わせする
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
