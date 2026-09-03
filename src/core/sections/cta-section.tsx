import Link from "next/link"
import React from "react"

type Props = {
  data: {
    enabled?: boolean | null
    heading?: string | null
    description?: string | null
    ctaLabel?: string | null
    ctaHref?: string | null
  }
}

export function CtaSection(props: Props) {
  if (!props.data.enabled) return null
  return (
    <section className="py-section-sm md:py-section bg-brand-dark text-white">
      <div className="max-w-wide mx-auto px-6 text-center">
        {props.data.heading ? (
          <h2 className="text-3xl font-bold mb-4">{props.data.heading}</h2>
        ) : null}
        {props.data.description ? (
          <p className="text-lg opacity-90 mb-8">{props.data.description}</p>
        ) : null}
        {props.data.ctaLabel && props.data.ctaHref ? (
          <Link
            href={props.data.ctaHref}
            className="inline-block px-8 py-4 bg-accent text-accent-foreground rounded-md font-semibold"
          >
            {props.data.ctaLabel}
          </Link>
        ) : null}
      </div>
    </section>
  )
}
