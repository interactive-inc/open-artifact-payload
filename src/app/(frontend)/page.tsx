import { draftMode } from 'next/headers'
import { getPayload } from 'payload'
import React from 'react'

import config from '@/payload.config'
import { HomeGrid } from '@/project/pages/home/sections/home-grid'

export default async function HomePage() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const draftState = await draftMode()
  const isDraft = draftState.isEnabled
  const home = await payload.findGlobal({ slug: 'home-page', depth: 2, draft: isDraft })
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
