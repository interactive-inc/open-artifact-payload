import { cache } from 'react'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import React from 'react'
import type { Metadata } from 'next'

import config from '@/payload.config'
import { buildPageMetadata } from '@/project/shared/lib/build-page-metadata'
import { HomeGrid } from '@/project/pages/home/sections/home-grid'
import { isLocale } from '@/project/shared/lib/is-locale'
import type { Locale } from '@/project/shared/lib/locale-types'

type Props = {
  params: Promise<{ locale: string }>
}

function resolveLocale(locale: string): Locale {
  if (!isLocale(locale)) notFound()
  return locale
}

const loadHome = cache(async (locale: Locale, isDraft: boolean) => {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  return payload.findGlobal({
    slug: 'home-page',
    depth: 2,
    draft: isDraft,
    locale,
    // 公開表示では relationship 先の access も適用し、下書き記事の populate を防ぐ。
    // ライブプレビューでは編集中の relationship を表示するため、従来どおりバイパスする。
    overrideAccess: isDraft,
  })
})

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const locale = resolveLocale(params.locale)
  const draftState = await draftMode()
  const home = await loadHome(locale, draftState.isEnabled)
  return buildPageMetadata({
    meta: home.meta,
    fallbackTitle: locale === 'ja' ? 'ホーム' : 'Home',
    basePath: '/',
  })
}

export default async function HomePage(props: Props) {
  const params = await props.params
  const locale = resolveLocale(params.locale)
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const draftState = await draftMode()
  const isDraft = draftState.isEnabled
  const home = await loadHome(locale, isDraft)
  const worksResult = await payload.find({
    collection: 'works',
    limit: 4,
    sort: '-publishedAt',
    draft: isDraft,
    where: isDraft ? undefined : { _status: { equals: 'published' } },
    depth: 1,
    locale,
  })

  return (
    <HomeGrid
      locale={locale}
      isDraft={isDraft}
      hero={home.hero ?? {}}
      services={home.services ?? {}}
      about={home.aboutPreview ?? {}}
      works={worksResult.docs}
      news={home.featuredNews ?? {}}
      cta={home.cta ?? {}}
    />
  )
}
