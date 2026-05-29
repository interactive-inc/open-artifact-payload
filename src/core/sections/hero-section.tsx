import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

import { resolveMediaAlt, resolveMediaUrl } from '@/core/lib/media'

type HeroData = {
  enabled?: boolean | null
  title?: string | null
  subtitle?: string | null
  image?: unknown
  ctaLabel?: string | null
  ctaHref?: string | null
}

type Props = {
  data: HeroData
}

export function HeroSection(props: Props) {
  if (!props.data.enabled) return null
  const imageUrl = resolveMediaUrl(props.data.image as never)
  const imageAlt = resolveMediaAlt(props.data.image as never) ?? ''

  return (
    <section className="relative py-24 bg-brand text-white">
      <div className="max-w-6xl mx-auto px-6">
        {imageUrl ? (
          <div className="absolute inset-0 opacity-30">
            <Image src={imageUrl} alt={imageAlt} fill className="object-cover" />
          </div>
        ) : null}
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl font-bold">{props.data.title}</h1>
          {props.data.subtitle ? (
            <p className="mt-4 text-xl opacity-90">{props.data.subtitle}</p>
          ) : null}
          {props.data.ctaLabel && props.data.ctaHref ? (
            <Link
              href={props.data.ctaHref}
              className="inline-block mt-8 px-6 py-3 bg-accent rounded-md font-semibold"
            >
              {props.data.ctaLabel}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  )
}
