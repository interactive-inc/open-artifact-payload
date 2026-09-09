import { locales, type Locale } from "@/i18n/locale-types"

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale)
}
