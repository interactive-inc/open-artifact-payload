import Link from "next/link"
import React from "react"
import { headers } from "next/headers"
import { ArrowRightIcon } from "lucide-react"

import { Button } from "@/project/shared/ui/button"
import { getUiDictionary } from "@/project/shared/lib/get-ui-dictionary"
import { isLocale } from "@/project/shared/lib/is-locale"
import { defaultLocale } from "@/project/shared/lib/locale-types"
import { withLocalePrefix } from "@/project/shared/lib/with-locale-prefix"
import "./styles.css"

// 存在しない URL に来たときの 404。サイト共通レイアウト（ヘッダー / フッター）の中に表示される。
// not-found.tsx は Next.js の仕様で params を受け取れないため、
// middleware が付与する x-locale リクエストヘッダーから locale を復元する。
export default async function NotFound() {
  const headerList = await headers()
  const localeHeader = headerList.get("x-locale") ?? ""
  const locale = isLocale(localeHeader) ? localeHeader : defaultLocale
  const dictionary = getUiDictionary(locale)

  return (
    <section className="container-site flex min-h-[60vh] flex-col items-start justify-center py-24">
      <p className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
        404 Not Found
      </p>
      <h1 className="mt-5 text-4xl font-bold tracking-tight md:text-6xl">
        {dictionary.notFound.title}
      </h1>
      <p className="mt-6 max-w-xl leading-relaxed text-muted-foreground">
        {dictionary.notFound.description}
      </p>
      <Button
        nativeButton={false}
        render={<Link href={withLocalePrefix(locale, "/")} />}
        className="mt-10"
      >
        {dictionary.notFound.backToHome}
        <ArrowRightIcon data-icon="inline-end" />
      </Button>
    </section>
  )
}
