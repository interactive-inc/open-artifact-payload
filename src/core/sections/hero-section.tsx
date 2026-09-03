import Image from "next/image"
import Link from "next/link"
import React from "react"

import type { MediaOrId } from "@/core/lib/media/types"
import { resolveMediaAlt } from "@/core/lib/media/resolve-media-alt"
import { resolveMediaUrl } from "@/core/lib/media/resolve-media-url"

type HeroData = {
  enabled?: boolean | null
  title?: string | null
  subtitle?: string | null
  image?: MediaOrId
  ctaLabel?: string | null
  ctaHref?: string | null
}

type Props = {
  data: HeroData
}

export function HeroSection(props: Props) {
  if (!props.data.enabled) return null
  const imageUrl = resolveMediaUrl(props.data.image)
  const imageAlt = resolveMediaAlt(props.data.image) ?? ""

  return (
    <section className="relative py-section bg-primary text-primary-foreground">
      <div className="max-w-content mx-auto px-6">
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
              className="inline-block mt-8 px-6 py-3 bg-accent text-accent-foreground rounded-md font-semibold"
            >
              {props.data.ctaLabel}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  )
}
