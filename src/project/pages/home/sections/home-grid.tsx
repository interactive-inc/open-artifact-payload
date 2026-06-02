import Link from 'next/link'
import React from 'react'
import { ArrowRightIcon } from 'lucide-react'

import { GenerativeCanvas } from '@/project/shared/components/generative-canvas'
import { Button } from '@/project/shared/ui/button'
import type { News } from '@/payload-types'

type ServiceItem = {
  icon?: string | null
  title?: string | null
  description?: string | null
}

type Props = {
  hero: {
    title?: string | null
    ctaLabel?: string | null
    ctaHref?: string | null
  }
  services: {
    heading?: string | null
    items?: ServiceItem[] | null
  }
  about: {
    heading?: string | null
    ctaLabel?: string | null
    ctaHref?: string | null
  }
  news: {
    items?: (number | News)[] | null
  }
  cta: {
    heading?: string | null
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

const serviceVariants = ['truchet', 'apollonian', 'penrose', 'wang'] as const
const statVariants = ['penrose', 'truchet', 'wang', 'apollonian'] as const

const categoryLabel: Record<string, string> = {
  info: 'お知らせ',
  press: 'プレスリリース',
  event: 'イベント',
}

// KV からニュース・CTA まで、ページ全体を 1 枚の連続したグリッドとして構成する。
// セクションごとの余白は設けず、gap-px の細線でセルを区切る。
export function HomeGrid(props: Props) {
  const serviceItems = props.services.items ?? []
  const newsItems = (props.news.items ?? []).filter(
    (item): item is News => typeof item === 'object' && item !== null,
  )

  return (
    <div className="mx-auto grid max-w-site grid-cols-2 gap-px bg-border md:grid-cols-6">
      {/* KV：全幅・全高のヒーロー。コピーは右下に寄せてアートを見せる。 */}
      <section className="relative isolate col-span-2 flex min-h-[92dvh] flex-col items-end justify-end overflow-hidden bg-white px-6 pb-16 pt-24 text-right md:col-span-6 md:px-12 md:pb-24 lg:px-20">
        <GenerativeCanvas variant="attractor" className="absolute inset-0 -z-20 size-full" />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_70%_80%,rgba(255,255,255,0.7)_0%,transparent_55%)]"
        />
        <h1 className="text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl">
          SAMPLE, then ship.
        </h1>
        {props.hero.ctaLabel && props.hero.ctaHref ? (
          <Button
            nativeButton={false}
            render={<Link href={props.hero.ctaHref} />}
            size="lg"
            className="mt-10 w-fit transition-transform active:scale-[0.98]"
          >
            {props.hero.ctaLabel}
            <ArrowRightIcon data-icon="inline-end" />
          </Button>
        ) : null}
      </section>

      {/* 見出しタイル */}
      <div className="relative isolate col-span-2 flex flex-col justify-center overflow-hidden bg-card p-10 md:col-span-3 md:min-h-[15rem]">
        <GenerativeCanvas
          variant="wang"
          className="absolute inset-0 -z-10 size-full opacity-[0.12]"
        />
        <p className="mb-4 text-sm font-medium tracking-[0.2em] text-muted-foreground">
          WHAT WE DO
        </p>
        {props.services.heading ? (
          <h2 className="text-3xl font-heading font-semibold leading-tight tracking-tight text-balance md:text-5xl">
            {props.services.heading}
          </h2>
        ) : null}
      </div>

      {/* 会社紹介：縦 2 段の大タイル */}
      <article className="group relative isolate col-span-2 flex flex-col justify-between overflow-hidden bg-card p-10 md:col-span-3 md:row-span-2 md:min-h-[15rem]">
        <GenerativeCanvas
          variant="metaballs"
          className="absolute inset-0 -z-10 size-full opacity-[0.2]"
        />
        <p className="text-sm font-medium tracking-[0.2em] text-muted-foreground">ABOUT</p>
        <div>
          {props.about.heading ? (
            <h3 className="text-2xl font-heading font-semibold leading-snug tracking-tight whitespace-pre-wrap md:text-4xl">
              {props.about.heading}
            </h3>
          ) : null}
          {props.about.ctaLabel && props.about.ctaHref ? (
            <Button
              nativeButton={false}
              render={<Link href={props.about.ctaHref} />}
              size="sm"
              className="mt-8"
            >
              {props.about.ctaLabel}
              <ArrowRightIcon data-icon="inline-end" />
            </Button>
          ) : null}
        </div>
      </article>

      {/* サービス：3 タイル */}
      {serviceItems.map((item, index) => (
        <article
          key={index}
          className="group relative isolate col-span-2 flex flex-col justify-end overflow-hidden bg-card p-8 md:col-span-1 md:min-h-[15rem]"
        >
          <GenerativeCanvas
            variant={serviceVariants[index % serviceVariants.length]}
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
            <h3 className="mt-2 text-lg font-heading font-semibold tracking-tight md:text-xl">
              {item.title}
            </h3>
          ) : null}
          {item.description ? (
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground line-clamp-3">
              {item.description}
            </p>
          ) : null}
        </article>
      ))}

      {/* 実績数値：3 列スパン × 4 タイル */}
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className={`relative isolate flex flex-col justify-center overflow-hidden p-10 md:col-span-3 md:min-h-[14rem] ${
            index % 2 === 0 ? 'bg-card' : 'bg-muted'
          }`}
        >
          <GenerativeCanvas
            variant={statVariants[index % statVariants.length]}
            className="absolute inset-0 -z-10 size-full opacity-[0.12]"
          />
          <span className="font-heading text-5xl font-bold tracking-tight md:text-7xl">
            {stat.value}
          </span>
          <span className="mt-2 text-sm text-muted-foreground">{stat.label}</span>
        </div>
      ))}

      {/* お知らせ：2 列スパン × 3 タイル */}
      {newsItems.slice(0, 3).map((item) => {
        const publishedDate = new Date(item.publishedAt)

        return (
          <Link
            key={item.id}
            href={`/news/${item.slug}`}
            className="group relative isolate col-span-2 flex flex-col justify-between gap-6 overflow-hidden bg-card p-8 transition-colors hover:bg-accent md:col-span-2 md:min-h-[14rem]"
          >
            <GenerativeCanvas
              variant="apollonian"
              className="absolute inset-0 -z-10 size-full opacity-[0.1] transition-opacity duration-500 group-hover:opacity-25"
            />
            <div className="flex items-center gap-3 text-xs text-muted-foreground tabular-nums">
              {item.category ? <span>{categoryLabel[item.category] ?? item.category}</span> : null}
              <time dateTime={publishedDate.toISOString().slice(0, 10)}>
                {publishedDate.toLocaleDateString('ja-JP')}
              </time>
            </div>
            <p className="font-medium leading-snug transition-colors group-hover:text-primary">
              {item.title}
            </p>
          </Link>
        )
      })}

      {/* CTA：全幅タイル */}
      {props.cta.heading ? (
        <section className="relative isolate col-span-2 flex flex-col items-start justify-center overflow-hidden bg-card p-12 md:col-span-6 md:min-h-[24rem] md:p-20">
          <GenerativeCanvas
            variant="metaballs"
            className="absolute inset-0 -z-10 size-full opacity-[0.18]"
          />
          <h2 className="max-w-2xl text-3xl font-bold leading-tight tracking-tight md:text-5xl">
            {props.cta.heading}
          </h2>
          {props.cta.ctaLabel && props.cta.ctaHref ? (
            <Button
              nativeButton={false}
              render={<Link href={props.cta.ctaHref} />}
              size="lg"
              className="mt-10 transition-transform active:scale-[0.98]"
            >
              {props.cta.ctaLabel}
              <ArrowRightIcon data-icon="inline-end" />
            </Button>
          ) : null}
        </section>
      ) : null}
    </div>
  )
}
