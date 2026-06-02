import type { GlobalConfig } from 'payload'

export const serviceGlobal: GlobalConfig = {
  slug: 'service',
  label: 'サービス',
  admin: {
    group: 'コンテンツ',
  },
  fields: [
    {
      name: 'hero',
      label: 'ページヘッダー',
      type: 'group',
      fields: [
        { name: 'enabled', label: '表示する', type: 'checkbox', defaultValue: true },
        { name: 'title', label: 'タイトル', type: 'text', required: true },
        { name: 'subtitle', label: 'サブタイトル', type: 'textarea' },
      ],
    },
    {
      name: 'services',
      label: 'サービス一覧',
      type: 'group',
      fields: [
        { name: 'enabled', label: '表示する', type: 'checkbox', defaultValue: true },
        { name: 'heading', label: '見出し', type: 'text' },
        {
          name: 'items',
          label: 'サービス',
          type: 'array',
          maxRows: 10,
          fields: [
            { name: 'icon', label: 'アイコン（絵文字）', type: 'text' },
            { name: 'title', label: 'タイトル', type: 'text', required: true },
            { name: 'description', label: '説明', type: 'textarea' },
            {
              name: 'features',
              label: '特徴・機能リスト',
              type: 'array',
              maxRows: 6,
              fields: [
                { name: 'text', label: 'テキスト', type: 'text', required: true },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'process',
      label: '開発・支援の流れ',
      type: 'group',
      fields: [
        { name: 'enabled', label: '表示する', type: 'checkbox', defaultValue: true },
        { name: 'heading', label: '見出し', type: 'text' },
        {
          name: 'steps',
          label: 'ステップ一覧',
          type: 'array',
          maxRows: 6,
          fields: [
            { name: 'title', label: 'タイトル', type: 'text', required: true },
            { name: 'description', label: '説明', type: 'textarea' },
          ],
        },
      ],
    },
    {
      name: 'cta',
      label: 'CTA',
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
