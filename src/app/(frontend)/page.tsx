import { draftMode } from 'next/headers'
import { getPayload } from 'payload'
import React from 'react'

import config from '@/payload.config'
import { HeroSection } from '@/project/shared/sections/hero-section'
import { FeaturedNewsSection } from '@/project/shared/sections/featured-news-section'
import { CtaSection } from '@/project/shared/sections/cta-section'
import { StatsBand } from '@/project/shared/sections/stats-band'
import { ProcessSection } from '@/project/shared/sections/process-section'
import { TestimonialsSection } from '@/project/shared/sections/testimonials-section'
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
      <StatsBand />
      <ServicesSection data={home.services ?? {}} />
      <ProcessSection />
      <AboutPreviewSection data={home.aboutPreview ?? {}} />
      <TestimonialsSection />
      <FeaturedNewsSection data={home.featuredNews ?? {}} />
      <CtaSection data={home.cta ?? {}} />
    </>
  )
}
