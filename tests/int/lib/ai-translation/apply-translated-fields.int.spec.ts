import { describe, expect, it } from 'vite-plus/test'

import { applyTranslatedFields } from '@/core/lib/ai-translation/apply-translated-fields'
import { collectLexicalTexts } from '@/core/lib/ai-translation/collect-lexical-texts'
import type { TranslatableField } from '@/core/lib/ai-translation/translation-types'

const sourceDoc = {
  title: 'タイトル',
  headerNav: [{ id: 'row1', label: 'ホーム', href: '/' }],
  body: {
    root: {
      type: 'root',
      children: [{ type: 'paragraph', children: [{ type: 'text', text: '本文です' }] }],
    },
  },
  untouched: '触らない',
}

const baseDoc = {
  id: 1,
  title: null,
  headerNav: [{ id: 'row1', label: null, href: '/' }],
  body: null,
  untouched: '既存の値',
}

const fields: TranslatableField[] = [
  { path: ['title'], kind: 'plain', texts: ['タイトル'] },
  { path: ['headerNav', 0, 'label'], kind: 'plain', texts: ['ホーム'] },
  { path: ['body'], kind: 'lexical', texts: ['本文です'] },
]

describe('applyTranslatedFields', () => {
  it('翻訳文を書き込み、触った top-level キーだけの update データを返す', () => {
    const updateData = applyTranslatedFields({
      baseDoc,
      sourceDoc,
      fields,
      translatedUnits: ['Title', 'Home', 'Body text'],
    })

    if (updateData instanceof Error) throw updateData

    expect(Object.keys(updateData).sort()).toEqual(['body', 'headerNav', 'title'])
    expect(updateData.title).toBe('Title')

    const nav = updateData.headerNav
    expect(Array.isArray(nav)).toBe(true)
    if (Array.isArray(nav)) {
      expect(nav[0]).toMatchObject({ id: 'row1', label: 'Home', href: '/' })
    }

    // lexical は原文の構造をベースに差し戻される
    expect(collectLexicalTexts(updateData.body)).toEqual(['Body text'])
    // baseDoc は破壊しない
    expect(baseDoc.title).toBeNull()
  })

  it('翻訳結果の総数が一致しないと Error', () => {
    const updateData = applyTranslatedFields({
      baseDoc,
      sourceDoc,
      fields,
      translatedUnits: ['Title'],
    })

    expect(updateData).toBeInstanceOf(Error)
  })

  it('書き込み先の親が無い場合は Error（既存データを壊さない）', () => {
    const updateData = applyTranslatedFields({
      baseDoc: { id: 1, headerNav: null },
      sourceDoc,
      fields: [{ path: ['headerNav', 0, 'label'], kind: 'plain', texts: ['ホーム'] }],
      translatedUnits: ['Home'],
    })

    expect(updateData).toBeInstanceOf(Error)
  })
})
