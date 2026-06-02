import React from 'react'

import { GenerativeCanvas } from '@/project/shared/components/generative-canvas'

type Props = {
  title: string
  description?: string | null
}

// 下層ページ共通のヘッダー。トップの KV と同じアトラクターを黒地に敷き、世界観を統一する。
export function PageHeader(props: Props) {
  return (
    <section className="relative isolate overflow-hidden bg-[oklch(0.12_0_0)] text-background">
      <GenerativeCanvas
        variant="attractor"
        className="absolute inset-0 -z-10 size-full opacity-50 invert"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_30%_60%,transparent_20%,oklch(0.12_0_0/0.85)_100%)]"
      />
      <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-36 md:pb-24 md:pt-40">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">{props.title}</h1>
        {props.description ? (
          <p className="mt-4 max-w-2xl text-lg text-background/75 md:text-xl">
            {props.description}
          </p>
        ) : null}
      </div>
    </section>
  )
}
