import type { Field } from 'payload'
import { describe, expect, it } from 'vite-plus/test'

import { extractTranslatableFields } from '@/core/lib/ai-translation/extract-translatable-fields'

const fields: Field[] = [
  { name: 'title', type: 'text', localized: true },
  { name: 'slug', type: 'text' },
  { name: 'internalMemo', type: 'textarea', localized: true, custom: { aiTranslate: false } },
  { name: 'category', type: 'select', options: ['info', 'press'] },
  { name: 'priceYen', type: 'number' },
  {
    name: 'companyInfo',
    type: 'group',
    fields: [
      { name: 'address', type: 'text', localized: true },
      { name: 'tel', type: 'text' },
    ],
  },
  {
    name: 'headerNav',
    type: 'array',
    fields: [
      { name: 'label', type: 'text', localized: true },
      { name: 'href', type: 'text' },
    ],
  },
  {
    name: 'localizedRows',
    type: 'array',
    localized: true,
    fields: [{ name: 'caption', type: 'text' }],
  },
  {
    name: 'sections',
    type: 'blocks',
    blocks: [
      {
        slug: 'cardBlock',
        fields: [
          { name: 'heading', type: 'text', localized: true },
          { name: 'anchorId', type: 'text' },
        ],
      },
    ],
  },
  {
    type: 'tabs',
    tabs: [
      {
        name: 'meta',
        label: 'メタ情報',
        fields: [{ name: 'description', type: 'textarea', localized: true }],
      },
    ],
  },
  { name: 'body', type: 'richText', localized: true },
]

const sourceData = {
  title: 'お知らせタイトル',
  slug: 'news-1',
  internalMemo: '社内メモ',
  category: 'info',
  priceYen: 1000,
  companyInfo: { address: '東京都千代田区', tel: '03-0000-0000' },
  headerNav: [
    { label: 'ホーム', href: '/' },
    { label: '会社概要', href: '/about' },
  ],
  localizedRows: [{ caption: 'ロケール別配列' }],
  sections: [{ blockType: 'cardBlock', heading: 'カード見出し', anchorId: 'card-1' }],
  meta: { description: '説明文です' },
  body: {
    root: {
      type: 'root',
      children: [{ type: 'paragraph', children: [{ type: 'text', text: '本文です' }] }],
    },
  },
}

describe('extractTranslatableFields', () => {
  it('localized な text/textarea/richText だけをパス付きで抽出する', () => {
    const extracted = extractTranslatableFields({ fields, sourceData })

    const paths = extracted.map((field) => field.path.join('.'))

    expect(paths).toEqual([
      'title',
      'companyInfo.address',
      'headerNav.0.label',
      'headerNav.1.label',
      'sections.0.heading',
      'meta.description',
      'body',
    ])
  })

  it('aiTranslate: false・非 localized・URL・select・数値は対象外', () => {
    const extracted = extractTranslatableFields({ fields, sourceData })

    const joined = extracted.flatMap((field) => field.texts).join('|')

    expect(joined).not.toContain('社内メモ')
    expect(joined).not.toContain('/about')
    expect(joined).not.toContain('news-1')
    expect(joined).not.toContain('card-1')
    expect(joined).not.toContain('info')
  })

  it('localized なコンテナ（array 自体など）はスキップする', () => {
    const extracted = extractTranslatableFields({ fields, sourceData })

    const joined = extracted.flatMap((field) => field.texts).join('|')

    expect(joined).not.toContain('ロケール別配列')
  })

  it('richText は lexical として text ノードを収集する', () => {
    const extracted = extractTranslatableFields({ fields, sourceData })

    const bodyField = extracted.find((field) => field.path.join('.') === 'body')

    expect(bodyField?.kind).toBe('lexical')
    expect(bodyField?.texts).toEqual(['本文です'])
  })

  it('原文が空のフィールドは抽出しない', () => {
    const extracted = extractTranslatableFields({
      fields,
      sourceData: { ...sourceData, title: '   ' },
    })

    expect(extracted.some((field) => field.path.join('.') === 'title')).toBe(false)
  })
})
