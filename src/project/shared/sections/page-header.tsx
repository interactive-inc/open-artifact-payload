import React from 'react'

type Props = {
  title: string
  description?: string | null
}

// 下層ページ共通のヘッダー。トップのヒーローと同じ斜めグラデーション基調で統一する。
export function PageHeader(props: Props) {
  return (
    <section className="relative isolate overflow-hidden bg-[oklch(0.22_0.08_268)] text-background">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(125deg,oklch(0.32_0.16_268)_0%,oklch(0.2_0.1_280)_55%,oklch(0.18_0.05_250)_100%)]"
      />
      <div
        aria-hidden
        className="absolute -top-32 -right-24 -z-10 size-[28rem] rounded-full bg-primary/30 blur-[110px]"
      />
      <div className="relative mx-auto max-w-6xl px-6 py-24 md:py-28">
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
