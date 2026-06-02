import Link from 'next/link'
import React from 'react'
import { ArrowRightIcon } from 'lucide-react'

import { GenerativeCanvas } from '@/project/shared/components/generative-canvas'
import { Button } from '@/project/shared/ui/button'

type ServiceItem = {
  icon?: string | null
  title?: string | null
  description?: string | null
}

type Props = {
  services: {
    heading?: string | null
    subheading?: string | null
    items?: ServiceItem[] | null
  }
  about: {
    heading?: string | null
    description?: string | null
    ctaLabel?: string | null
    ctaHref?: string | null
  }
}

type Stat = {
  value: string
  label: string
}

// 実績数値。サンプル値。本番では CMS 化するか実数に差し替える。
const stats: ReadonlyArray<Stat> = [
  { value: '120+', label: '制作実績' },
  { value: '15年', label: '事業継続' },
  { value: '98%', label: '継続率' },
  { value: '40名', label: 'メンバー' },
]

const canvasVariants = ['truchet', 'apollonian', 'penrose', 'wang'] as const

// トップを 1 枚の Bento グリッドに統合する。サービス・実績・会社紹介を大小タイルに混在させ、
// 各タイルにモノクロの幾何学 Canvas を敷く。角丸なし・広い余白で構成する。
export function HomeBento(props: Props) {
  const items = props.services.items ?? []

  return (
    <section className="px-6 py-32 md:px-12 md:py-48 lg:px-20">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-20 max-w-3xl md:mb-28">
          <p className="mb-4 text-sm font-medium tracking-[0.2em] text-muted-foreground">
            WHAT WE DO
          </p>
          {props.services.heading ? (
            <h2 className="text-4xl font-heading font-semibold leading-tight tracking-tight text-balance md:text-6xl">
              {props.services.heading}
            </h2>
          ) : null}
          {props.services.subheading ? (
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground md:text-xl">
              {props.services.subheading}
            </p>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-6 md:auto-rows-[16rem]">
          {/* 会社紹介：縦長の大タイル */}
          <article className="group relative isolate flex flex-col justify-between overflow-hidden bg-[oklch(0.13_0_0)] p-10 text-background md:col-span-2 md:row-span-2">
            <GenerativeCanvas
              variant="metaballs"
              className="absolute inset-0 -z-10 size-full opacity-40 invert"
            />
            <p className="text-sm font-medium tracking-[0.2em] text-background/60">ABOUT</p>
            <div>
              {props.about.heading ? (
                <h3 className="text-2xl font-heading font-semibold leading-snug tracking-tight whitespace-pre-wrap md:text-3xl">
                  {props.about.heading}
                </h3>
              ) : null}
              {props.about.description ? (
                <p className="mt-4 text-sm leading-relaxed text-background/70">
                  {props.about.description}
                </p>
              ) : null}
              {props.about.ctaLabel && props.about.ctaHref ? (
                <Button
                  nativeButton={false}
                  render={<Link href={props.about.ctaHref} />}
                  variant="secondary"
                  size="sm"
                  className="mt-8"
                >
                  {props.about.ctaLabel}
                  <ArrowRightIcon data-icon="inline-end" />
                </Button>
              ) : null}
            </div>
          </article>

          {/* サービス：横長の大タイル + 通常タイル */}
          {items.map((item, index) => {
            const variant = canvasVariants[index % canvasVariants.length]
            const isWide = index === 0

            return (
              <article
                key={index}
                className={`group relative isolate flex flex-col justify-end overflow-hidden bg-card p-8 ring-1 ring-foreground/10 ${
                  isWide ? 'md:col-span-4' : 'md:col-span-2'
                }`}
              >
                <GenerativeCanvas
                  variant={variant}
                  className="absolute inset-0 -z-10 size-full opacity-[0.3] transition-opacity duration-500 group-hover:opacity-60"
                />
                <div
                  aria-hidden
                  className="absolute inset-0 -z-10 bg-gradient-to-t from-card via-card/85 to-card/30"
                />
                <span className="font-heading text-sm text-muted-foreground tabular-nums">
                  {String(index + 1).padStart(2, '0')}
                </span>
                {item.title ? (
                  <h3 className="mt-2 text-xl font-heading font-semibold tracking-tight md:text-2xl">
                    {item.title}
                  </h3>
                ) : null}
                {item.description ? (
                  <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                ) : null}
              </article>
            )
          })}

          {/* 実績数値：横一列の 4 タイル */}
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col justify-center bg-[oklch(0.13_0_0)] p-8 text-background md:col-span-3 lg:col-span-1"
            >
              <span className="font-heading text-4xl font-bold tracking-tight md:text-5xl">
                {stat.value}
              </span>
              <span className="mt-2 text-sm text-background/60">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
