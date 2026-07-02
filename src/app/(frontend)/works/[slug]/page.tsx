import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getPayload } from 'payload'
import React from 'react'
import { ArrowLeftIcon } from 'lucide-react'

import type { Metadata } from 'next'

import config from '@/payload.config'
import { resolveMediaUrl, resolveMediaAlt } from '@/core/lib/media'
import { LexicalRenderer } from '@/core/lib/lexical'
import { Button } from '@/project/shared/ui/button'
import { workCategoryLabels } from '@/project/shared/lib/work-category-labels'
import '../../styles.css'

// 制作実績の画像が無いときの仮表示。固定 ID で毎回同じ写真が出る。
const fallbackImageUrl = 'https://picsum.photos/id/1059/1600/900'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const result = await payload.find({
    collection: 'works',
    where: { slug: { equals: params.slug } },
    limit: 1,
    depth: 0,
  })

  const item = result.docs[0]
  if (!item) return {}

  return {
    title: item.title,
    description: item.summary ?? undefined,
  }
}

export default async function WorkDetailPage(props: Props) {
  const params = await props.params
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const draftState = await draftMode()
  const isDraft = draftState.isEnabled
  const result = await payload.find({
    collection: 'works',
    where: { slug: { equals: params.slug } },
    limit: 1,
    draft: isDraft,
    depth: 1,
  })

  const item = result.docs[0]
  if (!item) notFound()

  const imageUrl = resolveMediaUrl(item.thumbnail as never) ?? fallbackImageUrl
  const imageAlt = resolveMediaAlt(item.thumbnail as never) ?? ''
  const publishedDate = new Date(item.publishedAt)

  return (
    <article>
      <header className="container-site pb-12 pt-36 md:pt-40">
        <p className="mb-4 text-sm font-medium tracking-[0.2em] text-muted-foreground">
          {workCategoryLabels[item.category] ?? item.category}
        </p>
        <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-6xl">
          {item.title}
        </h1>
        {item.summary ? (
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            {item.summary}
          </p>
        ) : null}
      </header>

      <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
        <Image src={imageUrl} alt={imageAlt} fill priority className="object-cover" />
      </div>

      <div className="container-site py-16 md:py-24">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-4">
            <dl className="flex flex-col gap-6 border-t border-border pt-6 text-sm">
              <div>
                <dt className="text-muted-foreground">カテゴリ</dt>
                <dd className="mt-1 font-medium">
                  {workCategoryLabels[item.category] ?? item.category}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">公開日</dt>
                <dd className="mt-1 font-medium tabular-nums">
                  {publishedDate.toLocaleDateString('ja-JP', {
                    year: 'numeric',
                    month: 'long',
                  })}
                </dd>
              </div>
            </dl>
          </div>
          <div className="md:col-span-8">
            <div className="prose max-w-none">
              <LexicalRenderer value={item.body} />
            </div>
          </div>
        </div>

        <div className="mt-16 border-t border-border pt-8">
          <Button nativeButton={false} render={<Link href="/works" />} variant="ghost">
            <ArrowLeftIcon data-icon="inline-start" />
            制作実績一覧へ戻る
          </Button>
        </div>
      </div>
    </article>
  )
}
