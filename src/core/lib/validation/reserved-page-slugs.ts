import { locales } from "@/project/shared/lib/locale-types"

/**
 * 汎用ページ (/[slug]) が既存ルートを乗っ取らないよう予約しておくスラッグ。
 * ロケールコードを含めるのは /en のような言語プレフィックスと衝突させないため。
 */
export const RESERVED_PAGE_SLUGS: ReadonlyArray<string> = [
  "admin",
  "api",
  "next",
  "_next",
  "preview",
  "news",
  "works",
  "faq",
  "contact",
  "about",
  "service",
  "sitemap.xml",
  "robots.txt",
  "icon.svg",
  "og-default.png",
  ...locales,
]
