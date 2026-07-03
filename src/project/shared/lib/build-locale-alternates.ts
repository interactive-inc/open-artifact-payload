import { locales } from '@/project/shared/lib/locale-types'
import { withLocalePrefix } from '@/project/shared/lib/with-locale-prefix'

/**
 * ページの basePath (locale プレフィックスなしの絶対パス) から
 * Metadata.alternates.languages 用のロケール別 URL マップを組み立てる。
 */
export function buildLocaleAlternates(basePath: string): Record<string, string> {
  const entries: Record<string, string> = {}
  for (const locale of locales) {
    entries[locale] = withLocalePrefix(locale, basePath)
  }
  return entries
}
