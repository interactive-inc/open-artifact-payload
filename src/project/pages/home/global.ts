import type { GlobalConfig } from 'payload'

export const homeGlobal: GlobalConfig = {
  slug: 'home-page',
  label: 'トップページ',
  admin: {
    group: 'コンテンツ',
  },
  fields: [
    {
      name: 'hero',
      label: 'ヒーロー',
      type: 'group',
      fields: [
        { name: 'enabled', label: '表示する', type: 'checkbox', defaultValue: true },
        { name: 'title', label: 'タイトル', type: 'text', required: true },
        { name: 'subtitle', label: 'サブタイトル', type: 'textarea' },
        { name: 'image', label: '背景画像', type: 'upload', relationTo: 'media' },
        { name: 'ctaLabel', label: 'ボタンテキスト', type: 'text' },
        { name: 'ctaHref', label: 'ボタンリンク', type: 'text' },
      ],
    },
    {
      name: 'featuredNews',
      label: '注目のお知らせ',
      type: 'group',
      fields: [
        { name: 'enabled', label: '表示する', type: 'checkbox', defaultValue: true },
        { name: 'heading', label: '見出し', type: 'text' },
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
        { name: 'heading', label: '見出し', type: 'text' },
        { name: 'description', label: '説明', type: 'textarea' },
        { name: 'ctaLabel', label: 'ボタンテキスト', type: 'text' },
        { name: 'ctaHref', label: 'ボタンリンク', type: 'text' },
      ],
    },
  ],
  versions: { drafts: true },
}
