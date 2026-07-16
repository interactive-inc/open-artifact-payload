import { describe, expect, it } from 'vite-plus/test'

import { isEmptyTranslationValue } from '@/core/lib/ai-translation/is-empty-translation-value'

describe('isEmptyTranslationValue', () => {
  it('plain: null / undefined / 空白のみ文字列は未入力', () => {
    expect(isEmptyTranslationValue(null, 'plain')).toBe(true)
    expect(isEmptyTranslationValue(undefined, 'plain')).toBe(true)
    expect(isEmptyTranslationValue('  ', 'plain')).toBe(true)
    expect(isEmptyTranslationValue('Hello', 'plain')).toBe(false)
  })

  it('lexical: text ノードが実質空なら未入力', () => {
    const emptyLexical = {
      root: { children: [{ type: 'paragraph', children: [{ type: 'text', text: ' ' }] }] },
    }
    const filledLexical = {
      root: { children: [{ type: 'paragraph', children: [{ type: 'text', text: 'Hi' }] }] },
    }

    expect(isEmptyTranslationValue(null, 'lexical')).toBe(true)
    expect(isEmptyTranslationValue(emptyLexical, 'lexical')).toBe(true)
    expect(isEmptyTranslationValue(filledLexical, 'lexical')).toBe(false)
  })
})
