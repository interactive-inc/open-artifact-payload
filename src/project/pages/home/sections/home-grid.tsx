import Link from 'next/link'
import Image from 'next/image'
import React from 'react'
import { ArrowRightIcon } from 'lucide-react'

import { resolveMediaUrl } from '@/core/lib/media/resolve-media-url'
import { resolveMediaAlt } from '@/core/lib/media/resolve-media-alt'
import { GenerativeCanvas } from '@/project/shared/components/generative-canvas'
import { Button } from '@/project/shared/ui/button'
import type { News, Work } from '@/payload-types'

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
  works: Work[]
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

// 以下はワイヤーフレーム用のサンプルデータ。本番では CMS 化または実データに差し替える。

type TechItem = {
  name: string
}

const techStack: ReadonlyArray<TechItem> = [
  { name: 'TypeScript' },
  { name: 'React' },
  { name: 'Next.js' },
  { name: 'Cloudflare' },
  { name: 'Payload CMS' },
  { name: 'Tailwind CSS' },
  { name: 'PostgreSQL' },
  { name: 'Figma' },
]

// 制作実績のサムネ未設定時の仮画像 ID。index ごとに固定で割り当てる。
const workFallbackIds = [1059, 180, 160, 0, 1062, 119]

const workCategoryLabel: Record<string, string> = {
  web: 'Web Design',
  product: 'Product',
  mobile: 'Mobile',
  frontend: 'Frontend',
  branding: 'Branding',
}

type Voice = {
  quote: string
  name: string
  role: string
  avatarId: number
}

const voices: ReadonlyArray<Voice> = [
  {
    quote: '要件が曖昧な段階から並走してくれて、想像以上の成果物に仕上がりました。',
    name: '田村 直樹',
    role: '製造業 / 事業企画部長',
    avatarId: 1005,
  },
  {
    quote: '公開後の改善提案まで含めて、長期的なパートナーとして信頼しています。',
    name: '小林 美咲',
    role: '小売 / マーケティング責任者',
    avatarId: 1011,
  },
]

const categoryLabel: Record<string, string> = {
  info: 'お知らせ',
  press: 'プレスリリース',
  event: 'イベント',
}

// 枠線を使わないミニマリスト構成。余白と文字サイズの対比（マイクロラベル → 大見出し →
// 巨大数字 → 墨ベタ CTA）でメリハリを作る。装飾は KV のアトラクター1箇所だけ。
export function HomeGrid(props: Props) {
  const serviceItems = props.services.items ?? []
  const newsItems = (props.news.items ?? []).filter(
    (item): item is News => typeof item === 'object' && item !== null,
  )

  return (
    <>
      {/* KV：ページ内で唯一の動きのある装飾。 */}
      <section className="relative isolate flex min-h-[92dvh] items-end overflow-hidden bg-white pb-16 pt-24 md:pb-24">
        <GenerativeCanvas variant="attractor" className="absolute inset-0 -z-20 size-full" />
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_70%_80%,rgba(255,255,255,0.7)_0%,transparent_55%)]"
        />
        <div className="container-site flex flex-col items-end text-right">
          <h1 className="text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl">
            SAMPLE, then ship.
          </h1>
          {props.hero.ctaLabel && props.hero.ctaHref ? (
            <Button
              nativeButton={false}
              render={<Link href={props.hero.ctaHref} />}
              size="lg"
              className="mt-8 w-fit transition-transform active:scale-[0.98]"
            >
              {props.hero.ctaLabel}
              <ArrowRightIcon data-icon="inline-end" />
            </Button>
          ) : null}
        </div>
      </section>

      {/* サービス：枠もカードも使わず、番号と余白だけで区切る。 */}
      <section className="container-site py-24 md:py-32">
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
          What we do
        </p>
        {props.services.heading ? (
          <h2 className="mt-5 max-w-3xl text-3xl font-semibold leading-tight tracking-tight text-balance md:text-5xl">
            {props.services.heading}
          </h2>
        ) : null}
        <div className="mt-16 grid grid-cols-1 gap-12 md:mt-24 md:grid-cols-3 md:gap-10">
          {serviceItems.map((item, index) => (
            <article key={index}>
              <span className="text-sm text-muted-foreground tabular-nums">
                {String(index + 1).padStart(2, '0')}
              </span>
              {item.title ? (
                <h3 className="mt-3 text-xl font-semibold tracking-tight md:text-2xl">
                  {item.title}
                </h3>
              ) : null}
              {item.description ? (
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              ) : null}
            </article>
          ))}
        </div>

        {/* 実績数値：タイルをやめ、巨大な数字そのものをビジュアルにする。 */}
        <div className="mt-24 grid grid-cols-2 gap-x-10 gap-y-16 md:mt-32 md:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label}>
              <span className="block text-5xl font-bold tracking-tight tabular-nums md:text-7xl">
                {stat.value}
              </span>
              <span className="mt-3 block text-sm text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 会社紹介：左に見出し、右に本文の 2 カラム。 */}
      <section className="container-site grid grid-cols-1 gap-8 py-24 md:grid-cols-12 md:gap-16 md:py-32">
        <div className="md:col-span-4">
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
            About
          </p>
          {props.about.heading ? (
            <h2 className="mt-5 text-3xl font-semibold leading-snug tracking-tight whitespace-pre-wrap md:text-4xl">
              {props.about.heading}
            </h2>
          ) : null}
        </div>
        <div className="md:col-span-8 md:pt-14">
          <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">
            プログラミングとデザインの両輪で、企業の課題をかたちにします。
            設計から実装、運用まで一貫して伴走し、長く使えるプロダクトを届けます。
          </p>
          {props.about.ctaLabel && props.about.ctaHref ? (
            <Button
              nativeButton={false}
              render={<Link href={props.about.ctaHref} />}
              variant="outline"
              className="mt-8"
            >
              {props.about.ctaLabel}
              <ArrowRightIcon data-icon="inline-end" />
            </Button>
          ) : null}
        </div>
      </section>

      {/* 使用技術：タグをやめ、大きなインラインテキスト1本にまとめる。 */}
      <section className="container-site py-24 md:py-32">
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
          Stack
        </p>
        <p className="mt-8 max-w-4xl text-2xl font-semibold leading-snug tracking-tight md:text-4xl">
          {techStack.map((tech, index) => (
            <React.Fragment key={tech.name}>
              {index > 0 ? <span className="text-muted-foreground/40"> / </span> : null}
              {tech.name}
            </React.Fragment>
          ))}
        </p>
      </section>

      {/* 制作実績：枠なしの 2 カラム写真グリッド。 */}
      <section className="container-site py-24 md:py-32">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
              Works
            </p>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight md:text-4xl">制作実績</h2>
          </div>
          <Button nativeButton={false} render={<Link href="/works" />} variant="ghost" size="sm">
            一覧を見る
            <ArrowRightIcon data-icon="inline-end" />
          </Button>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-x-10 gap-y-16 md:mt-16 md:grid-cols-2">
          {props.works.map((work, index) => {
            const imageUrl =
              resolveMediaUrl(work.thumbnail as never) ??
              `https://picsum.photos/id/${workFallbackIds[index % workFallbackIds.length]}/1200/750`
            const imageAlt = resolveMediaAlt(work.thumbnail as never) ?? ''

            return (
              <Link key={work.id} href={`/works/${work.slug}`} className="group block">
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
                  <Image
                    src={imageUrl}
                    alt={imageAlt}
                    fill
                    className="object-cover grayscale transition-all duration-500 group-hover:scale-105 group-hover:grayscale-0"
                  />
                </div>
                <div className="mt-5 flex items-baseline justify-between gap-4">
                  <h3 className="text-lg font-semibold tracking-tight md:text-xl">{work.title}</h3>
                  <span className="shrink-0 text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
                    {workCategoryLabel[work.category] ?? work.category}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* お客様の声：罫線を消し、引用文の文字サイズで読ませる。 */}
      <section className="container-site py-24 md:py-32">
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
          Voice
        </p>
        <div className="mt-12 grid grid-cols-1 gap-16 md:mt-16 md:grid-cols-2 md:gap-10">
          {voices.map((voice) => (
            <figure key={voice.name}>
              <blockquote className="text-xl leading-relaxed md:text-2xl">
                「{voice.quote}」
              </blockquote>
              <figcaption className="mt-8 flex items-center gap-4">
                <div className="relative size-12 overflow-hidden">
                  <Image
                    src={`https://picsum.photos/id/${voice.avatarId}/96/96`}
                    alt=""
                    fill
                    className="object-cover grayscale"
                  />
                </div>
                <div>
                  <div className="font-medium">{voice.name}</div>
                  <div className="text-sm text-muted-foreground">{voice.role}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* お知らせ：罫線なしのリスト。行間とホバー下線だけで整える。 */}
      {newsItems.length > 0 ? (
        <section className="container-site py-24 md:py-32">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
                News
              </p>
              <h2 className="mt-5 text-3xl font-semibold tracking-tight md:text-4xl">お知らせ</h2>
            </div>
            <Button nativeButton={false} render={<Link href="/news" />} variant="ghost" size="sm">
              一覧を見る
              <ArrowRightIcon data-icon="inline-end" />
            </Button>
          </div>
          <ul className="mt-12">
            {newsItems.slice(0, 3).map((item) => {
              const publishedDate = new Date(item.publishedAt)

              return (
                <li key={item.id}>
                  <Link
                    href={`/news/${item.slug}`}
                    className="group flex flex-col gap-1 py-5 md:flex-row md:items-baseline md:gap-8"
                  >
                    <time
                      dateTime={publishedDate.toISOString().slice(0, 10)}
                      className="shrink-0 text-sm text-muted-foreground tabular-nums md:w-32"
                    >
                      {publishedDate.toLocaleDateString('ja-JP')}
                    </time>
                    {item.category ? (
                      <span className="shrink-0 text-xs text-muted-foreground md:w-28">
                        {categoryLabel[item.category] ?? item.category}
                      </span>
                    ) : null}
                    <p className="font-medium leading-snug underline-offset-4 group-hover:underline">
                      {item.title}
                    </p>
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>
      ) : null}

      {/* CTA：墨ベタの全幅バンド。ページ唯一の反転ブロックとして締める。 */}
      {props.cta.heading ? (
        <section className="bg-primary py-24 text-primary-foreground md:py-32">
          <div className="container-site">
            <h2 className="max-w-3xl text-3xl font-bold leading-tight tracking-tight md:text-5xl">
              {props.cta.heading}
            </h2>
            {props.cta.ctaLabel && props.cta.ctaHref ? (
              <Button
                nativeButton={false}
                render={<Link href={props.cta.ctaHref} />}
                variant="secondary"
                size="lg"
                className="mt-10 transition-transform active:scale-[0.98]"
              >
                {props.cta.ctaLabel}
                <ArrowRightIcon data-icon="inline-end" />
              </Button>
            ) : null}
          </div>
        </section>
      ) : null}
    </>
  )
}
