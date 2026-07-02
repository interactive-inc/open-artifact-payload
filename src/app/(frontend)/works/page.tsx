import { draftMode } from 'next/headers'
import Link from 'next/link'
import Image from 'next/image'
import { getPayload } from 'payload'
import React from 'react'

import type { Metadata } from 'next'

import config from '@/payload.config'
import { resolveMediaUrl, resolveMediaAlt } from '@/core/lib/media'
import { PageHeader } from '@/project/shared/sections/page-header'
import { workCategoryLabels } from '@/project/shared/lib/work-category-labels'
import '../styles.css'

export const metadata: Metadata = {
  title: '制作実績',
}

// サムネイル未設定時の仮画像。slug ごとに固定 ID を割り当て、毎回同じ写真を出す。
const fallbackImageIds = [1059, 180, 160, 0, 1062, 119, 20, 48]

export default async function WorksListPage() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const draftState = await draftMode()
  const isDraft = draftState.isEnabled
  const result = await payload.find({
    collection: 'works',
    limit: 50,
    sort: '-publishedAt',
    draft: isDraft,
    depth: 1,
  })

  return (
    <div>
      <PageHeader title="制作実績" description="WORKS" />

      <section className="py-16 md:py-24">
        <div className="container-site">
          {result.docs.length === 0 ? (
            <p className="py-16 text-center text-muted-foreground">まだ制作実績がありません。</p>
          ) : (
            <div className="grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2">
              {result.docs.map((item, index) => {
                const imageUrl =
                  resolveMediaUrl(item.thumbnail as never) ??
                  `https://picsum.photos/id/${fallbackImageIds[index % fallbackImageIds.length]}/1200/750`
                const imageAlt = resolveMediaAlt(item.thumbnail as never) ?? ''

                return (
                  <Link key={item.id} href={`/works/${item.slug}`} className="group flex flex-col">
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
                      <Image
                        src={imageUrl}
                        alt={imageAlt}
                        fill
                        className="object-cover grayscale transition-all duration-500 group-hover:scale-105 group-hover:grayscale-0"
                      />
                    </div>
                    <div className="mt-5 flex flex-col gap-1">
                      <span className="text-xs font-medium tracking-[0.15em] text-muted-foreground">
                        {workCategoryLabels[item.category] ?? item.category}
                      </span>
                      <h2 className="text-xl font-heading font-semibold tracking-tight transition-colors group-hover:text-primary md:text-2xl">
                        {item.title}
                      </h2>
                      {item.summary ? (
                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                          {item.summary}
                        </p>
                      ) : null}
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
