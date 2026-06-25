import { cache } from 'react'
import { draftMode } from 'next/headers'
import { getPayload } from 'payload'
import React from 'react'
import type { Metadata } from 'next'

import config from '@/payload.config'
import { HeroSection } from '@/core/sections/hero-section'
import { FeaturedNewsSection } from '@/core/sections/featured-news-section'
import { CtaSection } from '@/core/sections/cta-section'
import { buildMetadata } from '@/core/lib/build-metadata'
import './styles.css'

const loadHome = cache(async (isDraft: boolean) => {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  return payload.findGlobal({ slug: 'home-page', depth: 2, draft: isDraft })
})

export async function generateMetadata(): Promise<Metadata> {
  const draftState = await draftMode()
  const home = await loadHome(draftState.isEnabled)
  return buildMetadata({ meta: home.meta, fallbackTitle: 'ホーム' })
}

export default async function HomePage() {
  const draftState = await draftMode()
  const isDraft = draftState.isEnabled
  const home = await loadHome(isDraft)

  return (
    <>
      <HeroSection data={home.hero ?? {}} />
      <FeaturedNewsSection data={home.featuredNews ?? {}} showDrafts={isDraft} />
      <CtaSection data={home.cta ?? {}} />
    </>
  )
}
