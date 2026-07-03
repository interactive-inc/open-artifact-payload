import { defaultLocale, type Locale } from '@/project/shared/lib/locale-types'

/**
 * defaultLocale (ja) 以外の場合のみ basePath に /en のようなプレフィックスを付与する。
 * basePath は '/' や '/about' のようなサイト内絶対パスを想定。CMS 入力の外部 URL
 * (https:// 等) が来た場合はプレフィックスを付けずそのまま返す。
 */
export function withLocalePrefix(locale: Locale, basePath: string): string {
  if (locale === defaultLocale) return basePath
  if (!basePath.startsWith('/')) return basePath
  return basePath === '/' ? `/${locale}` : `/${locale}${basePath}`
}
