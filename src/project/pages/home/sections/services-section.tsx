import React from 'react'

import { GenerativeCanvas } from '@/project/shared/components/generative-canvas'

type ServiceItem = {
  icon?: string | null
  title?: string | null
  description?: string | null
}

type Props = {
  data: {
    enabled?: boolean | null
    heading?: string | null
    subheading?: string | null
    items?: ServiceItem[] | null
  }
}

type Variant = 'truchet' | 'apollonian' | 'penrose' | 'wang'

// タイルごとに別のジェネラティブアルゴリズムを背景に敷く。
const variants: ReadonlyArray<Variant> = ['truchet', 'apollonian', 'penrose', 'wang']

// Bento グリッドのサービス紹介。大小のタイルにモノクロの幾何学 Canvas を重ねてダイナミックに見せる。
export function ServicesSection(props: Props) {
  if (!props.data.enabled) return null
  const items = props.data.items ?? []

  return (
    <section className="py-24 md:py-32">
      <div className="container-site">
        <div className="mb-16 max-w-2xl">
          <p className="mb-3 text-sm font-medium tracking-wide text-muted-foreground">SERVICES</p>
          {props.data.heading ? (
            <h2 className="text-3xl md:text-4xl font-heading font-semibold tracking-tight text-balance">
              {props.data.heading}
            </h2>
          ) : null}
          {props.data.subheading ? (
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              {props.data.subheading}
            </p>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:auto-rows-[15rem]">
          {items.map((item, index) => {
            const variant = variants[index % variants.length]
            const isFeatured = index === 0

            return (
              <article
                key={index}
                className={`group relative isolate flex flex-col justify-end overflow-hidden ring-1 ring-foreground/10 p-7 ${
                  isFeatured ? 'md:col-span-2 md:row-span-2' : ''
                }`}
              >
                <GenerativeCanvas
                  variant={variant}
                  className="absolute inset-0 -z-10 size-full opacity-[0.35] transition-opacity duration-500 group-hover:opacity-60"
                />
                <div
                  aria-hidden
                  className="absolute inset-0 -z-10 bg-gradient-to-t from-background via-background/85 to-background/40"
                />
                <span className="font-heading text-sm text-muted-foreground tabular-nums">
                  {String(index + 1).padStart(2, '0')}
                </span>
                {item.title ? (
                  <h3
                    className={`mt-2 font-heading font-semibold tracking-tight ${
                      isFeatured ? 'text-2xl md:text-3xl' : 'text-xl'
                    }`}
                  >
                    {item.title}
                  </h3>
                ) : null}
                {item.description ? (
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                ) : null}
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
