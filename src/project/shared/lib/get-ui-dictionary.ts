import type { Locale } from "@/project/shared/lib/locale-types"
import type { UiDictionary } from "@/project/shared/lib/ui-dictionary-types"
import { uiDictionaryJa } from "@/project/shared/lib/ui-dictionary-ja"
import { uiDictionaryEn } from "@/project/shared/lib/ui-dictionary-en"

const dictionaries: Record<Locale, UiDictionary> = {
  ja: uiDictionaryJa,
  en: uiDictionaryEn,
}

export function getUiDictionary(locale: Locale): UiDictionary {
  return dictionaries[locale]
}
