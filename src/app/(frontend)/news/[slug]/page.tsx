import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getPayload } from 'payload'
import React from 'react'
import { ArrowLeftIcon } from 'lucide-react'

import config from '@/payload.config'
import { LexicalRenderer } from '@/core/lib/lexical'
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
  if (!item) notFound()

  const publishedDate = new Date(item.publishedAt)

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
            <time
              dateTime={publishedDate.toISOString().slice(0, 10)}
              className="text-sm text-muted-foreground"
            >
              {publishedDate.toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
          </div>
          <h1 className="text-3xl font-bold tracking-tight leading-tight">{item.title}</h1>
        </header>
        <Separator className="mb-8" />
        <div className="prose max-w-none">
          <LexicalRenderer value={item.body} />
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
