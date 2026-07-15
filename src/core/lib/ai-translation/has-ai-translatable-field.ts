import type { Field } from 'payload'

import { isAiTranslateDisabled } from '@/core/lib/ai-translation/is-ai-translate-disabled'

/**
 * AI翻訳ボタンを表示するかどうかの判定。localized な text / textarea / richText を
 * 1つでも含む（かつ aiTranslate: false で除外されていない）エンティティが対象。
 */
export function hasAiTranslatableField(fields: ReadonlyArray<Field>): boolean {
  return fields.some((field) => {
    if (isAiTranslateDisabled(field)) return false

    if (field.type === 'text' || field.type === 'textarea' || field.type === 'richText') {
      return field.localized === true
    }

    if (field.type === 'group') {
      // extractTranslatableFields と同じく localized なコンテナは翻訳対象外
      if (field.localized === true) return false

      return hasAiTranslatableField(field.fields)
    }

    if (field.type === 'row' || field.type === 'collapsible') {
      return hasAiTranslatableField(field.fields)
    }

    if (field.type === 'array') {
      return field.localized !== true && hasAiTranslatableField(field.fields)
    }

    if (field.type === 'blocks') {
      if (field.localized === true) return false

      return (field.blocks ?? []).some((block) => hasAiTranslatableField(block.fields))
    }

    if (field.type === 'tabs') {
      return field.tabs.some(
        (tab) => !isAiTranslateDisabled(tab) && hasAiTranslatableField(tab.fields),
      )
    }

    return false
  })
}
