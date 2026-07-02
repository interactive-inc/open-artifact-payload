import { cache } from 'react'
import { draftMode } from 'next/headers'
import { getPayload } from 'payload'
import React from 'react'
import type { Metadata } from 'next'

import config from '@/payload.config'
import { buildPageMetadata } from '@/project/shared/lib/build-page-metadata'
import { HomeGrid } from '@/project/pages/home/sections/home-grid'

const loadHome = cache(async (isDraft: boolean) => {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  return payload.findGlobal({ slug: 'home-page', depth: 2, draft: isDraft })
})

export async function generateMetadata(): Promise<Metadata> {
  const draftState = await draftMode()
  const home = await loadHome(draftState.isEnabled)
  return buildPageMetadata({ meta: home.meta, fallbackTitle: 'ホーム' })
}

export default async function HomePage() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const draftState = await draftMode()
  const isDraft = draftState.isEnabled
  const home = await loadHome(isDraft)
  const worksResult = await payload.find({
    collection: 'works',
    limit: 4,
    sort: '-publishedAt',
    draft: isDraft,
    depth: 1,
  })

  return (
    <HomeGrid
      hero={home.hero ?? {}}
      services={home.services ?? {}}
      about={home.aboutPreview ?? {}}
      works={worksResult.docs}
      news={home.featuredNews ?? {}}
      cta={home.cta ?? {}}
    />
  )
}
