import { collectLexicalTexts } from '@/core/lib/ai-translation/collect-lexical-texts'

/**
 * 翻訳先ロケールの値が「未入力」かどうかの判定。
 * 未入力のフィールドだけを翻訳する（既存翻訳を不用意に上書きしない）ために使う。
 */
export function isEmptyTranslationValue(value: unknown, kind: 'plain' | 'lexical'): boolean {
  if (value === null || value === undefined) return true

  if (kind === 'plain') return typeof value !== 'string' || value.trim() === ''

  return collectLexicalTexts(value).every((text) => text.trim() === '')
}
