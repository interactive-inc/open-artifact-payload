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

// Stripe 風の斜めグラデーション背景を持つヒーロー。背景画像は CMS 優先、なければグラデのみ。
export function HeroSection(props: Props) {
  if (!props.data.enabled) return null
  const imageUrl = resolveMediaUrl(props.data.image as never)
  const imageAlt = resolveMediaAlt(props.data.image as never) ?? ''

  return (
    <section className="relative isolate overflow-hidden bg-[oklch(0.22_0.08_268)] text-background">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(125deg,oklch(0.32_0.16_268)_0%,oklch(0.2_0.1_280)_45%,oklch(0.18_0.05_250)_100%)]"
      />
      <div
        aria-hidden
        className="absolute -top-40 -right-32 -z-10 size-[36rem] rounded-full bg-primary/30 blur-[120px]"
      />
      {imageUrl ? (
        <div className="absolute inset-0 -z-10 opacity-15">
          <Image src={imageUrl} alt={imageAlt} fill className="object-cover" priority />
        </div>
      ) : null}

      <div className="relative mx-auto max-w-6xl px-6 py-32 md:py-40">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-bold leading-[1.1] tracking-tight whitespace-pre-wrap md:text-6xl">
            {props.data.title}
          </h1>
          {props.data.subtitle ? (
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-background/75 md:text-xl">
              {props.data.subtitle}
            </p>
          ) : null}
          {props.data.ctaLabel && props.data.ctaHref ? (
            <Button
              nativeButton={false}
              render={<Link href={props.data.ctaHref} />}
              size="lg"
              variant="secondary"
              className="mt-10 shadow-lg shadow-primary/20 transition-transform active:scale-[0.98]"
            >
              {props.data.ctaLabel}
              <ArrowRightIcon data-icon="inline-end" />
            </Button>
          ) : null}
        </div>
      </div>

      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 -z-10 h-px bg-gradient-to-r from-transparent via-background/20 to-transparent"
      />
    </section>
  )
}
