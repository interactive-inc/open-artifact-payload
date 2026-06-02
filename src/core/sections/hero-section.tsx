import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { ArrowRightIcon } from 'lucide-react'

import { resolveMediaAlt, resolveMediaUrl } from '@/core/lib/media'
import { Button } from '@/project/shared/ui/button'

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
    <section className="relative py-28 bg-foreground text-background overflow-hidden">
      {imageUrl ? (
        <div className="absolute inset-0 opacity-20">
          <Image src={imageUrl} alt={imageAlt} fill className="object-cover" />
        </div>
      ) : null}
      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight whitespace-pre-wrap">
            {props.data.title}
          </h1>
          {props.data.subtitle ? (
            <p className="mt-5 text-xl text-background/80 leading-relaxed">{props.data.subtitle}</p>
          ) : null}
          {props.data.ctaLabel && props.data.ctaHref ? (
            <Button
              nativeButton={false}
              nativeButton={false}
              render={<Link href={props.data.ctaHref} />}
              size="lg"
              variant="secondary"
              className="mt-8"
            >
              {props.data.ctaLabel}
              <ArrowRightIcon data-icon="inline-end" />
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  )
}
