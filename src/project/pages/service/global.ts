import type { GlobalConfig } from 'payload'

import { isAuthenticated } from '@/core/lib/access/is-authenticated'

export const serviceGlobal: GlobalConfig = {
  slug: 'service',
  label: 'サービス',
  admin: {
    group: 'コンテンツ',
  },
  access: {
    read: () => true,
    update: isAuthenticated,
  },
  fields: [
    {
      name: 'hero',
      label: 'ページヘッダー',
      type: 'group',
      fields: [
        { name: 'enabled', label: '表示する', type: 'checkbox', defaultValue: true },
        { name: 'title', label: 'タイトル', type: 'text', required: true, localized: true },
        { name: 'subtitle', label: 'サブタイトル', type: 'textarea', localized: true },
      ],
    },
    {
      name: 'services',
      label: 'サービス一覧',
      type: 'group',
      fields: [
        { name: 'enabled', label: '表示する', type: 'checkbox', defaultValue: true },
        { name: 'heading', label: '見出し', type: 'text', localized: true },
        {
          name: 'items',
          label: 'サービス',
          type: 'array',
          maxRows: 10,
          fields: [
            { name: 'icon', label: 'アイコン（絵文字）', type: 'text' },
            { name: 'title', label: 'タイトル', type: 'text', required: true, localized: true },
            { name: 'description', label: '説明', type: 'textarea', localized: true },
            {
              name: 'features',
              label: '特徴・機能リスト',
              type: 'array',
              maxRows: 6,
              fields: [
                { name: 'text', label: 'テキスト', type: 'text', required: true, localized: true },
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
        { name: 'heading', label: '見出し', type: 'text', localized: true },
        {
          name: 'steps',
          label: 'ステップ一覧',
          type: 'array',
          maxRows: 6,
          fields: [
            { name: 'title', label: 'タイトル', type: 'text', required: true, localized: true },
            { name: 'description', label: '説明', type: 'textarea', localized: true },
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
        { name: 'heading', label: '見出し', type: 'text', localized: true },
        { name: 'description', label: '説明', type: 'textarea', localized: true },
        { name: 'ctaLabel', label: 'ボタンテキスト', type: 'text', localized: true },
        { name: 'ctaHref', label: 'ボタンリンク', type: 'text' },
      ],
    },
  ],
  versions: { drafts: true },
}
