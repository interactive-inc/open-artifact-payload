import type { Field, Tab } from 'payload'

/**
 * フィールド定義の `custom: { aiTranslate: false }` によるオプトアウト判定。
 * 多言語入力の対象（localized）だが AI 翻訳はさせたくないフィールドに指定する。
 */
export function isAiTranslateDisabled(field: Field | Tab): boolean {
  if (!('custom' in field) || !field.custom || typeof field.custom !== 'object') return false

  return Reflect.get(field.custom, 'aiTranslate') === false
}
