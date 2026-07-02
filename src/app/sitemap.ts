import { getPayload } from 'payload'

import type { MetadataRoute } from 'next'

import config from '@/payload.config'

// コンテンツは D1 由来のため、ビルド時ではなくリクエスト時に生成する。
export const dynamic = 'force-dynamic'

const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000'

const staticPaths = ['/', '/about', '/service', '/works', '/news', '/faq', '/contact']

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

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

  const staticEntries = staticPaths.map((path) => ({
    url: path === '/' ? `${baseUrl}/` : `${baseUrl}${path}`,
  }))

  const newsEntries = newsResult.docs.map((item) => ({
    url: `${baseUrl}/news/${item.slug}`,
    lastModified: item.updatedAt,
  }))

  const workEntries = worksResult.docs.map((item) => ({
    url: `${baseUrl}/works/${item.slug}`,
    lastModified: item.updatedAt,
  }))

  return [...staticEntries, ...newsEntries, ...workEntries]
}
