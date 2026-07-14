import { describe, expect, it } from 'vite-plus/test'

import { guardTranslations } from '@/core/lib/ai-translation/guard-translations'

describe('guardTranslations', () => {
  it('件数が一致すればそのまま返す', () => {
    const guarded = guardTranslations({
      sourceUnits: ['こんにちは', '見出し'],
      translations: ['Hello', 'Heading'],
    })

    expect(guarded).toEqual(['Hello', 'Heading'])
  })

  it('空白のみの原文は翻訳結果を使わず原文を維持する', () => {
    const guarded = guardTranslations({
      sourceUnits: ['  ', 'テキスト'],
      translations: ['unexpected', 'Text'],
    })

    expect(guarded).toEqual(['  ', 'Text'])
  })

  it('件数不一致は Error', () => {
    expect(guardTranslations({ sourceUnits: ['a', 'b'], translations: ['A'] })).toBeInstanceOf(
      Error,
    )
  })

  it('原文に対して異常に長い翻訳は Error（暴走ガード）', () => {
    const guarded = guardTranslations({
      sourceUnits: ['短い'],
      translations: ['x'.repeat(3000)],
    })

    expect(guarded).toBeInstanceOf(Error)
  })
})
