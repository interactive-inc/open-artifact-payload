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
import { loadSiteSettings } from '@/core/lib/load-site-settings'
import { resolveMediaUrl } from '@/core/lib/media/resolve-media-url'
import { buildPageMetadata } from '@/project/shared/lib/build-page-metadata'
import { JsonLd } from '@/project/shared/components/json-ld'
import { Badge } from '@/project/shared/ui/badge'
import { isLocale } from '@/project/shared/lib/is-locale'
import { withLocalePrefix } from '@/project/shared/lib/with-locale-prefix'
import { getUiDictionary } from '@/project/shared/lib/get-ui-dictionary'
import type { Locale } from '@/project/shared/lib/locale-types'
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

type Props = {
  params: Promise<{ locale: string; slug: string }>
}

function resolveLocale(locale: string): Locale {
  if (!isLocale(locale)) notFound()
  return locale
}

// generateMetadata と本体で同一クエリを共有するため React.cache で memo 化する。
const loadNewsBySlug = cache(async (slug: string, locale: Locale, isDraft: boolean) => {
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
    locale,
  })
  return result.docs[0] ?? null
})

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const locale = resolveLocale(params.locale)
  const draftState = await draftMode()
  const item = await loadNewsBySlug(params.slug, locale, draftState.isEnabled)
  if (!item) return {}
  return buildPageMetadata({
    meta: item.meta,
    fallbackTitle: item.title,
    basePath: `/news/${params.slug}`,
  })
}

export default async function NewsDetailPage(props: Props) {
  const params = await props.params
  const locale = resolveLocale(params.locale)
  const dictionary = getUiDictionary(locale)
  const draftState = await draftMode()
  const item = await loadNewsBySlug(params.slug, locale, draftState.isEnabled)
  if (!item) {
    notFound()
  }

  const publishedDate = formatNewsDate(item.publishedAt, locale)
  const settings = await loadSiteSettings(locale)
  const metaImageUrl = resolveMediaUrl(item.meta?.image as never)
  const articleJsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: item.title,
    datePublished: item.publishedAt,
    dateModified: item.updatedAt,
    publisher: {
      '@type': 'Organization',
      name: settings.siteName,
    },
  }
  if (metaImageUrl) articleJsonLd.image = [metaImageUrl]

  return (
    <div>
      <JsonLd data={articleJsonLd} />
      <section className="bg-muted/30 py-6">
        <div className="container-site">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href={withLocalePrefix(locale, '/')}>
                  {dictionary.common.home}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={withLocalePrefix(locale, '/news')}>
                  {dictionary.news.title}
                </BreadcrumbLink>
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
              <Badge variant="secondary">
                {dictionary.news.categoryLabels[item.category] ?? item.category}
              </Badge>
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
        <Button
          nativeButton={false}
          render={<Link href={withLocalePrefix(locale, '/news')} />}
          variant="ghost"
        >
          <ArrowLeftIcon data-icon="inline-start" />
          {dictionary.news.backToList}
        </Button>
      </article>
    </div>
  )
}
