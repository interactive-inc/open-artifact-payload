import Link from 'next/link'
import Image from 'next/image'
import React from 'react'
import { ArrowRightIcon } from 'lucide-react'

import { resolveMediaUrl, resolveMediaAlt } from '@/core/lib/media'
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

const serviceVariants = ['truchet', 'apollonian', 'penrose', 'wang'] as const
const statVariants = ['penrose', 'truchet', 'wang', 'apollonian'] as const

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

type BentoGridProps = {
  children: React.ReactNode
}

// Bento グリッドの塊。外箱で余白、内側のグリッドで border を持つ。
// このまとまりを複数並べ、塊どうしの間は余白（py）で区切る。
function BentoGrid(props: BentoGridProps) {
  return (
    <div className="mx-auto max-w-site md:px-12 lg:px-20">
      <div className="grid grid-cols-2 gap-px border-y border-border bg-border md:grid-cols-6 md:border-x">
        {props.children}
      </div>
    </div>
  )
}

// KV から CTA まで。意味のまとまりごとに Bento グリッドを分け、塊の間を余白で区切る。
export function HomeGrid(props: Props) {
  const serviceItems = props.services.items ?? []
  const newsItems = (props.news.items ?? []).filter(
    (item): item is News => typeof item === 'object' && item !== null,
  )

  return (
    <>
      {/* KV：グリッドの外。背景は全幅、中身は container-site で他セクションと左右端を揃える。 */}
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

      {/* グリッド① 会社概要のまとまり：サービス・会社紹介・実績 */}
      <div className="py-16 md:py-24">
        <BentoGrid>
          {/* 見出しタイル：全幅 */}
          <div className="relative isolate col-span-2 flex flex-col justify-center overflow-hidden bg-background p-8 md:col-span-6 md:min-h-[12rem]">
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

          {/* サービス：6 列を 3 等分する 3 タイル（各 2 列） */}
          {serviceItems.map((item, index) => (
            <article
              key={index}
              className="group relative isolate col-span-2 flex flex-col justify-end overflow-hidden bg-card p-8 md:col-span-2 md:min-h-[18rem]"
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
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                  {item.description}
                </p>
              ) : null}
            </article>
          ))}

          {/* 実績数値：3 列スパン × 4 タイル */}
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className={`relative isolate flex flex-col justify-center overflow-hidden p-8 md:col-span-3 md:min-h-[14rem] ${
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
        </BentoGrid>
      </div>

      {/* 会社紹介：グリッド外の通常セクション。左に見出し、右に本文という 2 カラム。 */}
      <section className="py-16 md:py-24">
        <div className="container-site grid grid-cols-1 gap-8 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-4">
            <p className="mb-4 text-sm font-medium tracking-[0.2em] text-muted-foreground">ABOUT</p>
            {props.about.heading ? (
              <h2 className="text-3xl font-heading font-semibold leading-snug tracking-tight whitespace-pre-wrap md:text-4xl">
                {props.about.heading}
              </h2>
            ) : null}
          </div>
          <div className="md:col-span-8 md:pt-12">
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
        </div>
      </section>

      {/* グリッド② 技術と実績のまとまり：使用技術・制作実績 */}
      <div className="py-16 md:py-24">
        <BentoGrid>
          {/* 技術スタック見出し：2 列 */}
          <div className="col-span-2 flex flex-col justify-center bg-background p-8 md:col-span-2 md:min-h-[12rem]">
            <p className="mb-4 text-sm font-medium tracking-[0.2em] text-muted-foreground">STACK</p>
            <h2 className="text-2xl font-heading font-semibold tracking-tight md:text-3xl">
              使用技術
            </h2>
          </div>

          {/* 技術スタック：タグを並べた 4 列タイル */}
          <div className="col-span-2 flex flex-wrap content-center gap-2 bg-card p-8 md:col-span-4 md:min-h-[12rem]">
            {techStack.map((tech) => (
              <span key={tech.name} className="border border-border px-4 py-2 text-sm font-medium">
                {tech.name}
              </span>
            ))}
          </div>

          {/* 制作実績見出し：全幅 */}
          <div className="col-span-2 flex items-end justify-between bg-background p-8 md:col-span-6">
            <div>
              <p className="mb-4 text-sm font-medium tracking-[0.2em] text-muted-foreground">
                WORKS
              </p>
              <h2 className="text-2xl font-heading font-semibold tracking-tight md:text-4xl">
                制作実績
              </h2>
            </div>
            <Button nativeButton={false} render={<Link href="/works" />} variant="ghost" size="sm">
              一覧を見る
              <ArrowRightIcon data-icon="inline-end" />
            </Button>
          </div>

          {/* 制作実績：画像付き 3 列タイル × 4。works コレクションから取得し詳細へリンク。 */}
          {props.works.map((work, index) => {
            const imageUrl =
              resolveMediaUrl(work.thumbnail as never) ??
              `https://picsum.photos/id/${workFallbackIds[index % workFallbackIds.length]}/1200/750`
            const imageAlt = resolveMediaAlt(work.thumbnail as never) ?? ''

            return (
              <Link
                key={work.id}
                href={`/works/${work.slug}`}
                className="group relative isolate col-span-2 flex flex-col justify-end overflow-hidden bg-card md:col-span-3"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden">
                  <Image
                    src={imageUrl}
                    alt={imageAlt}
                    fill
                    className="object-cover grayscale transition-all duration-500 group-hover:scale-105 group-hover:grayscale-0"
                  />
                </div>
                <div className="flex flex-col gap-1 p-8">
                  <span className="text-xs font-medium tracking-[0.15em] text-muted-foreground">
                    {workCategoryLabel[work.category] ?? work.category}
                  </span>
                  <h3 className="text-lg font-heading font-semibold tracking-tight transition-colors group-hover:text-primary md:text-xl">
                    {work.title}
                  </h3>
                </div>
              </Link>
            )
          })}
        </BentoGrid>
      </div>

      {/* お客様の声：グリッド外の通常セクション。引用カードを横並び。 */}
      <section className="py-16 md:py-24">
        <div className="container-site">
          <p className="mb-4 text-sm font-medium tracking-[0.2em] text-muted-foreground">VOICE</p>
          <h2 className="mb-12 text-3xl font-heading font-semibold tracking-tight md:text-4xl">
            お客様の声
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {voices.map((voice) => (
              <figure key={voice.name} className="flex flex-col gap-8 border-t border-border pt-8">
                <blockquote className="text-lg leading-relaxed">「{voice.quote}」</blockquote>
                <figcaption className="flex items-center gap-4">
                  <div className="relative size-12 overflow-hidden ring-1 ring-foreground/10">
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
        </div>
      </section>

      {/* お知らせ：グリッド外の通常セクション。リスト表示。 */}
      {newsItems.length > 0 ? (
        <section className="py-16 md:py-24">
          <div className="container-site">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <p className="mb-4 text-sm font-medium tracking-[0.2em] text-muted-foreground">
                  NEWS
                </p>
                <h2 className="text-3xl font-heading font-semibold tracking-tight md:text-4xl">
                  お知らせ
                </h2>
              </div>
              <Button nativeButton={false} render={<Link href="/news" />} variant="ghost" size="sm">
                一覧を見る
                <ArrowRightIcon data-icon="inline-end" />
              </Button>
            </div>
            <ul className="border-t border-border">
              {newsItems.slice(0, 3).map((item) => {
                const publishedDate = new Date(item.publishedAt)

                return (
                  <li key={item.id} className="border-b border-border">
                    <Link
                      href={`/news/${item.slug}`}
                      className="group flex flex-col gap-1 py-6 transition-colors hover:text-primary md:flex-row md:items-center md:gap-8"
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
                      <p className="font-medium leading-snug">{item.title}</p>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        </section>
      ) : null}

      {/* CTA：グリッド外の全幅ブロック。 */}
      {props.cta.heading ? (
        <section className="px-6 pb-16 md:px-12 md:pb-24 lg:px-20">
          <div className="relative isolate mx-auto flex max-w-site flex-col items-start justify-center overflow-hidden bg-card p-8 ring-1 ring-border md:min-h-[24rem] md:p-16">
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
                className="mt-8 transition-transform active:scale-[0.98]"
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
