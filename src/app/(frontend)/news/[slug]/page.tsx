import { cache } from 'react'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getPayload } from 'payload'
import React from 'react'
import { ArrowLeftIcon } from 'lucide-react'

import type { Metadata } from 'next'

import config from '@/payload.config'
import { RichText } from '@/core/lib/lexical'
import { formatNewsDate } from '@/core/lib/format-news-date'
import { buildMetadata } from '@/core/lib/build-metadata'
import { Badge } from '@/project/shared/ui/badge'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/project/shared/ui/breadcrumb'
import { Separator } from '@/project/shared/ui/separator'
import { Button } from '@/project/shared/ui/button'
import '../../styles.css'

const categoryLabel: Record<string, string> = {
  info: 'お知らせ',
  press: 'プレスリリース',
  event: 'イベント',
}

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
    <div>
      <section className="bg-muted/30 py-6">
        <div className="container-site">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">ホーム</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/news">お知らせ</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="truncate max-w-xs">{item.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </section>

      <article className="container-site py-12">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            {item.category ? (
              <Badge variant="secondary">{categoryLabel[item.category] ?? item.category}</Badge>
            ) : null}
            {publishedDate ? (
              <time dateTime={publishedDate.dateTime} className="text-sm text-muted-foreground">
                {publishedDate.label}
              </time>
            ) : null}
          </div>
          <h1 className="text-3xl font-bold tracking-tight leading-tight">{item.title}</h1>
        </header>
        <Separator className="mb-8" />
        <div className="prose max-w-none">
          <RichText data={item.body} />
        </div>
        <Separator className="mt-12 mb-8" />
        <Button nativeButton={false} render={<Link href="/news" />} variant="ghost">
          <ArrowLeftIcon data-icon="inline-start" />
          お知らせ一覧へ戻る
        </Button>
      </article>
    </div>
  )
}
