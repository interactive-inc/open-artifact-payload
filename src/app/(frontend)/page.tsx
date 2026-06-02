import { draftMode } from 'next/headers'
import { getPayload } from 'payload'
import React from 'react'

import config from '@/payload.config'
import { HeroSection } from '@/core/sections/hero-section'
import { FeaturedNewsSection } from '@/core/sections/featured-news-section'
import { CtaSection } from '@/core/sections/cta-section'
import { ServicesSection } from '@/project/pages/home/sections/services-section'
import { AboutPreviewSection } from '@/project/pages/home/sections/about-preview-section'

export default async function HomePage() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const draftState = await draftMode()
  const isDraft = draftState.isEnabled
  const home = await payload.findGlobal({ slug: 'home-page', depth: 2, draft: isDraft })

  return (
    <>
      <HeroSection data={home.hero ?? {}} />
      <ServicesSection data={home.services ?? {}} />
      <AboutPreviewSection data={home.aboutPreview ?? {}} />
      <FeaturedNewsSection data={home.featuredNews ?? {}} />
      <CtaSection data={home.cta ?? {}} />
    </>
  )
}
