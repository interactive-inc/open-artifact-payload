import Link from 'next/link'
import React from 'react'
import { ArrowRightIcon } from 'lucide-react'

import { Button } from '@/project/shared/ui/button'
import { GenerativeCanvas } from '@/project/shared/components/generative-canvas'

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

// 白基調のヒーロー。数式フィールドの流線アートを背景に敷き、その上に黒い文字を置く。
export function HeroSection(props: Props) {
  if (!props.data.enabled) return null

  return (
    <section className="relative isolate flex min-h-[100dvh] items-center overflow-hidden bg-white text-foreground">
      <GenerativeCanvas variant="metaballs" className="absolute inset-0 -z-20 size-full" />

      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_50%,transparent_30%,rgba(255,255,255,0.6)_100%)]"
      />

      <div className="relative mx-auto w-full max-w-6xl px-6 pt-24">
        <div className="max-w-2xl">
          <p className="mb-6 inline-flex items-center rounded-full border border-foreground/15 bg-white/70 px-4 py-1.5 text-sm font-medium text-foreground/70 backdrop-blur-sm">
            テクノロジーで、ビジネスを次の段階へ
          </p>
          <h1 className="text-4xl font-bold leading-[1.1] tracking-tight whitespace-pre-wrap md:text-6xl">
            {props.data.title}
          </h1>
          {props.data.subtitle ? (
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">
              {props.data.subtitle}
            </p>
          ) : null}
          {props.data.ctaLabel && props.data.ctaHref ? (
            <Button
              nativeButton={false}
              render={<Link href={props.data.ctaHref} />}
              size="lg"
              className="mt-10 shadow-lg transition-transform active:scale-[0.98]"
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
