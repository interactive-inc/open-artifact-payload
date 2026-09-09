import type { Locale } from "@/i18n/locale-types"
import type { UiDictionary } from "@/i18n/ui-dictionary-types"
import { uiDictionaryJa } from "@/i18n/ui-dictionary-ja"
import { uiDictionaryEn } from "@/i18n/ui-dictionary-en"

const dictionaries: Record<Locale, UiDictionary> = {
  ja: uiDictionaryJa,
  en: uiDictionaryEn,
}

export function getUiDictionary(locale: Locale): UiDictionary {
  return dictionaries[locale]
}
