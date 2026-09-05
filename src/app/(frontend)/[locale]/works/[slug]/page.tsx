import { cache } from "react"
import { getFrontendAccess, type FrontendAccess } from "@/core/lib/preview/get-frontend-access"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { getPayload } from "payload"
import React from "react"
import { ArrowLeftIcon } from "lucide-react"

import type { Metadata } from "next"

import config from "@/payload.config"
import { resolveMediaUrl } from "@/core/lib/media/resolve-media-url"
import { resolveMediaAlt } from "@/core/lib/media/resolve-media-alt"
import { RichText } from "@/core/lib/lexical"
import { buildPageMetadata } from "@/project/shared/lib/build-page-metadata"
import { Button } from "@/project/shared/ui/button"
import { workCategoryLabels } from "@/project/shared/lib/work-category-labels"
import { isLocale } from "@/project/shared/lib/is-locale"
import { withLocalePrefix } from "@/project/shared/lib/with-locale-prefix"
import { getUiDictionary } from "@/project/shared/lib/get-ui-dictionary"
import type { Locale } from "@/project/shared/lib/locale-types"
import "../../styles.css"

// 制作実績の画像が無いときの仮表示。固定 ID で毎回同じ写真が出る。
const fallbackImageUrl = "https://picsum.photos/id/1059/1600/900"

type Props = {
  params: Promise<{ locale: string; slug: string }>
}

function resolveLocale(locale: string): Locale {
  if (!isLocale(locale)) notFound()
  return locale
}

// generateMetadata と本体で同一クエリを共有するため React.cache で memo 化する。
const loadWorkBySlug = cache(async (slug: string, locale: Locale, access: FrontendAccess) => {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const conditions: Record<string, { equals: string }>[] = [{ slug: { equals: slug } }]
  if (!access.draft) conditions.push({ _status: { equals: "published" } })
  const result = await payload.find({
    collection: "works",
    where: { and: conditions },
    limit: 1,
    depth: 1,
    ...access,
    locale,
  })
  return result.docs[0] ?? null
})

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const locale = resolveLocale(params.locale)
  const access = await getFrontendAccess()
  const item = await loadWorkBySlug(params.slug, locale, access)
  if (!item) return {}

  // meta.description 未入力時は概要文を SEO ディスクリプションとして流用する。
  return buildPageMetadata({
    meta: {
      title: item.meta?.title,
      description: item.meta?.description ?? item.summary,
      image: item.meta?.image,
    },
    fallbackTitle: item.title,
    basePath: `/works/${item.slug}`,
  })
}

export default async function WorkDetailPage(props: Props) {
  const params = await props.params
  const locale = resolveLocale(params.locale)
  const dictionary = getUiDictionary(locale)
  const access = await getFrontendAccess()
  const item = await loadWorkBySlug(params.slug, locale, access)
  if (!item) {
    notFound()
  }

  const imageUrl = resolveMediaUrl(item.thumbnail as never) ?? fallbackImageUrl
  const imageAlt = resolveMediaAlt(item.thumbnail as never) ?? ""
  const publishedDate = new Date(item.publishedAt)
  const dateLocale = locale === "en" ? "en-US" : "ja-JP"

  return (
    <article>
      <header className="container-site pb-12 pt-36 md:pt-40">
        <p className="mb-4 text-sm font-medium tracking-[0.2em] text-muted-foreground">
          {workCategoryLabels[item.category] ?? item.category}
        </p>
        <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-6xl">
          {item.title}
        </h1>
        {item.summary ? (
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            {item.summary}
          </p>
        ) : null}
      </header>

      <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
        <Image src={imageUrl} alt={imageAlt} fill priority className="object-cover" />
      </div>

      <div className="container-site py-16 md:py-24">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-4">
            <dl className="flex flex-col gap-6 border-t border-border pt-6 text-sm">
              <div>
                <dt className="text-muted-foreground">{dictionary.works.category}</dt>
                <dd className="mt-1 font-medium">
                  {workCategoryLabels[item.category] ?? item.category}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{dictionary.works.publishedAt}</dt>
                <dd className="mt-1 font-medium tabular-nums">
                  {publishedDate.toLocaleDateString(dateLocale, {
                    year: "numeric",
                    month: "long",
                  })}
                </dd>
              </div>
            </dl>
          </div>
          <div className="md:col-span-8">
            <div className="prose max-w-none">
              <RichText data={item.body} />
            </div>
          </div>
        </div>

        <div className="mt-16 border-t border-border pt-8">
          <Button
            nativeButton={false}
            render={<Link href={withLocalePrefix(locale, "/works")} />}
            variant="ghost"
          >
            <ArrowLeftIcon data-icon="inline-start" />
            {dictionary.works.backToList}
          </Button>
        </div>
      </div>
    </article>
  )
}
