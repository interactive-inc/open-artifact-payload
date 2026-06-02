import Link from 'next/link'
import Image from 'next/image'
import React from 'react'

import { resolveMediaUrl, resolveMediaAlt } from '@/core/lib/media'

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
  const imageUrl = resolveMediaUrl(props.data.image as never)
  const imageAlt = resolveMediaAlt(props.data.image as never) ?? ''

  return (
    <section className="py-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            {props.data.heading ? (
              <h2 className="text-3xl font-bold text-gray-900 mb-6">{props.data.heading}</h2>
            ) : null}
            {props.data.description ? (
              <p className="text-gray-600 leading-relaxed text-lg">{props.data.description}</p>
            ) : null}
            {props.data.ctaLabel && props.data.ctaHref ? (
              <Link
                href={props.data.ctaHref}
                className="inline-block mt-8 px-6 py-3 border-2 border-brand text-brand font-semibold rounded-md hover:bg-brand hover:text-white transition-colors"
              >
                {props.data.ctaLabel}
              </Link>
            ) : null}
          </div>
          <div className="relative">
            {imageUrl ? (
              <div className="aspect-[4/3] relative rounded-xl overflow-hidden shadow-lg">
                <Image src={imageUrl} alt={imageAlt} fill className="object-cover" />
              </div>
            ) : (
              <div className="aspect-[4/3] bg-gradient-to-br from-brand/20 to-brand-dark/20 rounded-xl flex items-center justify-center">
                <div className="text-brand/40">
                  <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
