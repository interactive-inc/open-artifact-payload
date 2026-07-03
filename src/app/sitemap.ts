import { getPayload } from 'payload'

import type { MetadataRoute } from 'next'

import config from '@/payload.config'
import { locales, type Locale } from '@/project/shared/lib/locale-types'
import { withLocalePrefix } from '@/project/shared/lib/with-locale-prefix'

// コンテンツは D1 由来のため、ビルド時ではなくリクエスト時に生成する。
export const dynamic = 'force-dynamic'

const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000'

const staticPaths = ['/', '/about', '/service', '/works', '/news', '/faq', '/contact']

function toLanguageAlternates(basePath: string): Record<string, string> {
  const entries: Record<string, string> = {}

  for (const locale of locales) {
    entries[locale] = `${baseUrl}${withLocalePrefix(locale, basePath)}`
  }

  return entries
}

function toEntry(
  locale: Locale,
  basePath: string,
  lastModified?: string,
): MetadataRoute.Sitemap[number] {
  return {
    url: `${baseUrl}${withLocalePrefix(locale, basePath)}`,
    lastModified,
    alternates: { languages: toLanguageAlternates(basePath) },
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  // news / works の slug は localized ではない (全 locale 共通) ため、
  // 取得は 1 回で済ませて両 locale 分の URL を組み立てる。
  const newsResult = await payload.find({
    collection: 'news',
    where: { _status: { equals: 'published' } },
    limit: 1000,
    depth: 0,
    sort: '-publishedAt',
  })

  const worksResult = await payload.find({
    collection: 'works',
    where: { _status: { equals: 'published' } },
    limit: 1000,
    depth: 0,
    sort: '-publishedAt',
  })

  const sitemapEntries: MetadataRoute.Sitemap = []

  for (const locale of locales) {
    for (const staticPath of staticPaths) {
      sitemapEntries.push(toEntry(locale, staticPath))
    }

    for (const newsItem of newsResult.docs) {
      sitemapEntries.push(toEntry(locale, `/news/${newsItem.slug}`, newsItem.updatedAt))
    }

    for (const workItem of worksResult.docs) {
      sitemapEntries.push(toEntry(locale, `/works/${workItem.slug}`, workItem.updatedAt))
    }
  }

  return sitemapEntries
}
