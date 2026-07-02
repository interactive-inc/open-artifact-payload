import React from 'react'

import { GenerativeCanvas } from '@/project/shared/components/generative-canvas'

type Props = {
  title: string
  description?: string | null
}

// 下層ページ共通のヘッダー。動きのあるアトラクターはトップ KV 専用とし、
// 下層は静的なタイルパターンを薄く敷いて控えめに世界観を揃える。
export function PageHeader(props: Props) {
  return (
    <section className="relative isolate overflow-hidden bg-white text-foreground">
      <GenerativeCanvas
        variant="truchet"
        className="absolute inset-0 -z-10 size-full opacity-[0.14]"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_30%_60%,transparent_20%,rgba(255,255,255,0.7)_100%)]"
      />
      <div className="container-site relative pb-20 pt-36 md:pb-24 md:pt-40">
        <h1 className="text-4xl font-bold tracking-tight md:text-6xl">{props.title}</h1>
        {props.description ? (
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground md:text-xl">
            {props.description}
          </p>
        ) : null}
      </div>
    </section>
  )
}
