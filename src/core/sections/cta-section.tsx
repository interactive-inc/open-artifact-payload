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

export function CtaSection(props: Props) {
  if (!props.data.enabled) return null
  return (
    <section className="py-20 bg-foreground text-background">
      <div className="max-w-4xl mx-auto px-6 text-center">
        {props.data.heading ? (
          <h2 className="text-3xl font-bold tracking-tight mb-4">{props.data.heading}</h2>
        ) : null}
        {props.data.description ? (
          <p className="text-lg text-background/80 mb-8">{props.data.description}</p>
        ) : null}
        {props.data.ctaLabel && props.data.ctaHref ? (
          <Button render={<Link href={props.data.ctaHref} />} size="lg" variant="secondary">
            {props.data.ctaLabel}
            <ArrowRightIcon data-icon="inline-end" />
          </Button>
        ) : null}
      </div>
    </section>
  )
}
