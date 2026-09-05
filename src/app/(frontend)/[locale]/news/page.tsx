import Link from "next/link"
import { getFrontendAccess } from "@/core/lib/preview/get-frontend-access"
import { notFound } from "next/navigation"
import { getPayload } from "payload"
import React from "react"

import config from "@/payload.config"
import { formatNewsDate } from "@/core/lib/format-news-date"
import { Badge } from "@/project/shared/ui/badge"
import { Separator } from "@/project/shared/ui/separator"
import { PageHeader } from "@/project/shared/sections/page-header"
import { isLocale } from "@/project/shared/lib/is-locale"
import { withLocalePrefix } from "@/project/shared/lib/with-locale-prefix"
import { getUiDictionary } from "@/project/shared/lib/get-ui-dictionary"
import { buildLocaleAlternates } from "@/project/shared/lib/build-locale-alternates"
import type { Locale } from "@/project/shared/lib/locale-types"
import type { Metadata } from "next"

import "../styles.css"

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
    title: dictionary.news.title,
    alternates: { languages: buildLocaleAlternates("/news") },
  }
}

export default async function NewsListPage(props: Props) {
  const params = await props.params
  const locale = resolveLocale(params.locale)
  const dictionary = getUiDictionary(locale)
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const access = await getFrontendAccess()
  // Payload は draft: false でも _status='draft' のレコードを返してしまうため、
  // 公開フロントでは where: { _status: 'published' } を明示する。
  // ライブプレビュー(isDraft=true)時はその制約を外し、下書きを含めて見せる。
  const result = await payload.find({
    collection: "news",
    limit: 20,
    sort: "-publishedAt",
    ...access,
    where: access.draft ? undefined : { _status: { equals: "published" } },
    locale,
  })

  return (
    <div>
      <PageHeader title={dictionary.news.title} description={dictionary.news.description} />

      <section className="py-16">
        <div className="container-site">
          {result.docs.length === 0 ? (
            <p className="text-center text-muted-foreground py-16">{dictionary.news.empty}</p>
          ) : (
            <ul>
              {result.docs.map((item, index) => {
                const publishedDate = formatNewsDate(item.publishedAt, locale)
                return (
                  <li key={item.id}>
                    {index > 0 ? <Separator /> : null}
                    <Link
                      href={withLocalePrefix(locale, `/news/${item.slug}`)}
                      className="flex gap-6 py-6 hover:bg-muted/50 -mx-4 px-4 rounded-lg transition-colors"
                    >
                      {publishedDate ? (
                        <time
                          dateTime={publishedDate.dateTime}
                          className="text-sm text-muted-foreground whitespace-nowrap pt-0.5 w-24 flex-shrink-0"
                        >
                          {publishedDate.label}
                        </time>
                      ) : null}
                      <div className="flex flex-col gap-2">
                        {item.category ? (
                          <Badge variant="secondary" className="w-fit">
                            {dictionary.news.categoryLabels[item.category] ?? item.category}
                          </Badge>
                        ) : null}
                        <p className="text-sm font-medium leading-snug hover:underline">
                          {item.title}
                        </p>
                      </div>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </section>
    </div>
  )
}
