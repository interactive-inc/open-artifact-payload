import type { GlobalConfig } from 'payload'

import { buildGlobalRevalidateAfterChange } from '@/core/lib/revalidate/build-global-revalidate-after-change'

export const homeGlobal: GlobalConfig = {
  slug: 'home-page',
  label: 'トップページ',
  admin: {
    group: 'コンテンツ',
  },
  hooks: {
    // トップページ編集後に / を revalidate する。
    afterChange: [buildGlobalRevalidateAfterChange(() => ['/'])],
  },
  fields: [
    {
      name: 'hero',
      label: 'ヒーロー',
      type: 'group',
      fields: [
        { name: 'enabled', label: '表示する', type: 'checkbox', defaultValue: true },
        { name: 'title', label: 'タイトル', type: 'text', required: true, localized: true },
        { name: 'subtitle', label: 'サブタイトル', type: 'textarea', localized: true },
        { name: 'image', label: '背景画像', type: 'upload', relationTo: 'media' },
        { name: 'ctaLabel', label: 'ボタンテキスト', type: 'text', localized: true },
        { name: 'ctaHref', label: 'ボタンリンク', type: 'text' },
      ],
    },
    {
      name: 'services',
      label: 'サービス紹介',
      type: 'group',
      fields: [
        { name: 'enabled', label: '表示する', type: 'checkbox', defaultValue: true },
        { name: 'heading', label: '見出し', type: 'text', localized: true },
        { name: 'subheading', label: 'サブ見出し', type: 'textarea', localized: true },
        {
          name: 'items',
          label: 'サービス一覧',
          type: 'array',
          maxRows: 6,
          fields: [
            { name: 'icon', label: 'アイコン（絵文字）', type: 'text' },
            { name: 'title', label: 'タイトル', type: 'text', required: true, localized: true },
            { name: 'description', label: '説明', type: 'textarea', localized: true },
          ],
        },
      ],
    },
    {
      name: 'aboutPreview',
      label: '会社紹介',
      type: 'group',
      fields: [
        { name: 'enabled', label: '表示する', type: 'checkbox', defaultValue: true },
        { name: 'heading', label: '見出し', type: 'text', localized: true },
        { name: 'description', label: '説明', type: 'textarea', localized: true },
        { name: 'image', label: '画像', type: 'upload', relationTo: 'media' },
        { name: 'ctaLabel', label: 'ボタンテキスト', type: 'text', localized: true },
        { name: 'ctaHref', label: 'ボタンリンク', type: 'text' },
      ],
    },
    {
      name: 'featuredNews',
      label: '注目のお知らせ',
      type: 'group',
      fields: [
        { name: 'enabled', label: '表示する', type: 'checkbox', defaultValue: true },
        { name: 'heading', label: '見出し', type: 'text', localized: true },
        {
          name: 'items',
          label: '表示する記事',
          type: 'relationship',
          relationTo: 'news',
          hasMany: true,
          maxRows: 3,
        },
      ],
    },
    {
      name: 'cta',
      label: 'コールトゥアクション',
      type: 'group',
      fields: [
        { name: 'enabled', label: '表示する', type: 'checkbox', defaultValue: false },
        { name: 'heading', label: '見出し', type: 'text', localized: true },
        { name: 'description', label: '説明', type: 'textarea', localized: true },
        { name: 'ctaLabel', label: 'ボタンテキスト', type: 'text', localized: true },
        { name: 'ctaHref', label: 'ボタンリンク', type: 'text' },
      ],
    },
  ],
  versions: { drafts: true },
}
