import Link from 'next/link'
import Image from 'next/image'
import React from 'react'
import { ArrowRightIcon } from 'lucide-react'

import { resolveMediaUrl, resolveMediaAlt } from '@/core/lib/media'
import { Button } from '@/project/shared/ui/button'

// CMS に画像が無いときの仮表示。固定 ID なので毎回同じ写真が出る。本番では CMS の画像が優先される。
const fallbackImageUrl = 'https://picsum.photos/id/180/1200/900'

type Props = {
  data: {
    enabled?: boolean | null
    heading?: string | null
    description?: string | null
    image?: unknown
    ctaLabel?: string | null
    ctaHref?: string | null
  }
}

export function AboutPreviewSection(props: Props) {
  if (!props.data.enabled) return null
  const imageUrl = resolveMediaUrl(props.data.image as never) ?? fallbackImageUrl
  const imageAlt = resolveMediaAlt(props.data.image as never) ?? ''

  return (
    <section className="py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
          <div>
            {props.data.heading ? (
              <h2 className="text-3xl md:text-4xl font-heading font-semibold tracking-tight mb-6 whitespace-pre-wrap text-balance">
                {props.data.heading}
              </h2>
            ) : null}
            {props.data.description ? (
              <p className="text-muted-foreground leading-relaxed text-lg">
                {props.data.description}
              </p>
            ) : null}
            {props.data.ctaLabel && props.data.ctaHref ? (
              <Button
                nativeButton={false}
                render={<Link href={props.data.ctaHref} />}
                variant="outline"
                className="mt-8"
              >
                {props.data.ctaLabel}
                <ArrowRightIcon data-icon="inline-end" />
              </Button>
            ) : null}
          </div>
          <div className="relative">
            <div
              aria-hidden
              className="absolute -inset-4 -z-10 rounded-xl bg-[linear-gradient(135deg,oklch(0.52_0.21_268/0.18),transparent)] blur-xl"
            />
            <div className="aspect-[4/3] relative rounded-xl overflow-hidden shadow-xl ring-1 ring-foreground/5">
              <Image src={imageUrl} alt={imageAlt} fill className="object-cover" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
