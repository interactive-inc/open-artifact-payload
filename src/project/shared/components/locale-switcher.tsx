"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import React from "react"

import { locales, type Locale } from "@/project/shared/lib/locale-types"
import { withoutLocalePrefix } from "@/project/shared/lib/without-locale-prefix"
import { withLocalePrefix } from "@/project/shared/lib/with-locale-prefix"
import { cn } from "@/project/shared/lib/utils"

type Props = {
  locale: Locale
}

const localeLabels: Record<Locale, string> = {
  ja: "JA",
  en: "EN",
}

// 言語切り替え。現在の pathname から locale を除いた基準パスを、切替先 locale のプレフィックスで組み直す。
export function LocaleSwitcher(props: Props) {
  const pathname = usePathname()
  const basePath = withoutLocalePrefix(pathname)

  return (
    <div className="flex items-center gap-1 px-2 text-sm font-medium text-muted-foreground">
      {locales.map((locale, index) => (
        <React.Fragment key={locale}>
          {index > 0 ? <span className="text-muted-foreground/40">/</span> : null}
          <Link
            href={withLocalePrefix(locale, basePath)}
            className={cn(
              "transition-colors hover:text-foreground",
              locale === props.locale && "text-foreground font-semibold",
            )}
          >
            {localeLabels[locale]}
          </Link>
        </React.Fragment>
      ))}
    </div>
  )
}
