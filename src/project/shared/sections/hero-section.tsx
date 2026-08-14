import Link from "next/link"
import React from "react"
import { ArrowRightIcon } from "lucide-react"

import { Button } from "@/project/shared/ui/button"
import { GenerativeCanvas } from "@/project/shared/components/generative-canvas"

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
      <GenerativeCanvas variant="attractor" className="absolute inset-0 -z-20 size-full" />

      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_50%,transparent_30%,rgba(255,255,255,0.6)_100%)]"
      />

      <div className="relative container-site">
        <h1 className="max-w-4xl text-5xl font-bold leading-[1.05] tracking-tight whitespace-pre-wrap md:text-8xl">
          {props.data.title}
        </h1>
        {props.data.ctaLabel && props.data.ctaHref ? (
          <Button
            nativeButton={false}
            render={<Link href={props.data.ctaHref} />}
            size="lg"
            className="mt-12 transition-transform active:scale-[0.98]"
          >
            {props.data.ctaLabel}
            <ArrowRightIcon data-icon="inline-end" />
          </Button>
        ) : null}
      </div>
    </section>
  )
}
