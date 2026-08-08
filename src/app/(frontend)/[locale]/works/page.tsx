import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getPayload } from 'payload'
import React from 'react'

import type { Metadata } from 'next'

import config from '@/payload.config'
import { resolveMediaUrl } from '@/core/lib/media/resolve-media-url'
import { resolveMediaAlt } from '@/core/lib/media/resolve-media-alt'
import { PageHeader } from '@/project/shared/sections/page-header'
import { workCategoryLabels } from '@/project/shared/lib/work-category-labels'
import { isLocale } from '@/project/shared/lib/is-locale'
import { withLocalePrefix } from '@/project/shared/lib/with-locale-prefix'
import { getUiDictionary } from '@/project/shared/lib/get-ui-dictionary'
import { buildLocaleAlternates } from '@/project/shared/lib/build-locale-alternates'
import type { Locale } from '@/project/shared/lib/locale-types'
import '../styles.css'

// サムネイル未設定時の仮画像。slug ごとに固定 ID を割り当て、毎回同じ写真を出す。
const fallbackImageIds = [1059, 180, 160, 0, 1062, 119, 20, 48]

type Props = {
  params: Promise<{ locale: string }>
}

function resolveLocale(locale: string): Locale {
  if (!isLocale(locale)) notFound()
  return locale
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const locale = resolveLocale(params.locale)
  const dictionary = getUiDictionary(locale)

  return {
    title: dictionary.works.title,
    alternates: { languages: buildLocaleAlternates('/works') },
  }
}

export default async function WorksListPage(props: Props) {
  const params = await props.params
  const locale = resolveLocale(params.locale)
  const dictionary = getUiDictionary(locale)
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const draftState = await draftMode()
  const isDraft = draftState.isEnabled
  const result = await payload.find({
    collection: 'works',
    limit: 50,
    sort: '-publishedAt',
    draft: isDraft,
    where: isDraft ? undefined : { _status: { equals: 'published' } },
    depth: 1,
    locale,
  })

  return (
    <div>
      <PageHeader title={dictionary.works.title} description="WORKS" />

      <section className="py-16 md:py-24">
        <div className="container-site">
          {result.docs.length === 0 ? (
            <p className="py-16 text-center text-muted-foreground">{dictionary.works.empty}</p>
          ) : (
            <div className="grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2">
              {result.docs.map((item, index) => {
                const imageUrl =
                  resolveMediaUrl(item.thumbnail as never) ??
                  `https://picsum.photos/id/${fallbackImageIds[index % fallbackImageIds.length]}/1200/750`
                const imageAlt = resolveMediaAlt(item.thumbnail as never) ?? ''

                return (
                  <Link
                    key={item.id}
                    href={withLocalePrefix(locale, `/works/${item.slug}`)}
                    className="group flex flex-col"
                  >
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
                      <Image
                        src={imageUrl}
                        alt={imageAlt}
                        fill
                        className="object-cover grayscale transition-all duration-500 group-hover:scale-105 group-hover:grayscale-0"
                      />
                    </div>
                    <div className="mt-5 flex flex-col gap-1">
                      <span className="text-xs font-medium tracking-[0.15em] text-muted-foreground">
                        {workCategoryLabels[item.category] ?? item.category}
                      </span>
                      <h2 className="text-xl font-heading font-semibold tracking-tight transition-colors group-hover:text-primary md:text-2xl">
                        {item.title}
                      </h2>
                      {item.summary ? (
                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                          {item.summary}
                        </p>
                      ) : null}
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
