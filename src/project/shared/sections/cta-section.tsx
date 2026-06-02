import Link from 'next/link'
import React from 'react'
import { ArrowRightIcon } from 'lucide-react'

import { Button } from '@/project/shared/ui/button'

type Props = {
  data: {
    enabled?: boolean | null
    heading?: string | null
    description?: string | null
    ctaLabel?: string | null
    ctaHref?: string | null
  }
}

// Stripe 風のグラデーションパネル CTA。角丸の濃色ブロックを白背景の上に浮かせる。
export function CtaSection(props: Props) {
  if (!props.data.enabled) return null

  return (
    <section className="px-6 py-24">
      <div className="relative isolate mx-auto max-w-6xl overflow-hidden rounded-3xl bg-[oklch(0.24_0.1_268)] px-8 py-20 text-background shadow-2xl shadow-primary/10 md:px-16">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[linear-gradient(120deg,oklch(0.34_0.17_268)_0%,oklch(0.2_0.09_280)_100%)]"
        />
        <div
          aria-hidden
          className="absolute -bottom-24 -left-16 -z-10 size-80 rounded-full bg-primary/30 blur-[100px]"
        />
        <div className="max-w-2xl">
          {props.data.heading ? (
            <h2 className="text-3xl font-bold leading-tight tracking-tight md:text-4xl">
              {props.data.heading}
            </h2>
          ) : null}
          {props.data.description ? (
            <p className="mt-5 text-lg leading-relaxed text-background/75">
              {props.data.description}
            </p>
          ) : null}
          {props.data.ctaLabel && props.data.ctaHref ? (
            <Button
              nativeButton={false}
              render={<Link href={props.data.ctaHref} />}
              size="lg"
              variant="secondary"
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
