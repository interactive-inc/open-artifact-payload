import { locales, type Locale } from '@/project/shared/lib/locale-types'

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale)
}
