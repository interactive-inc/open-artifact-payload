import type { GlobalConfig } from 'payload'

export const aboutGlobal: GlobalConfig = {
  slug: 'about',
  label: '会社概要',
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
      name: 'mission',
      label: 'ミッション・ビジョン',
      type: 'group',
      fields: [
        { name: 'enabled', label: '表示する', type: 'checkbox', defaultValue: true },
        { name: 'heading', label: '見出し', type: 'text' },
        { name: 'description', label: '説明', type: 'textarea' },
        {
          name: 'values',
          label: 'バリュー一覧',
          type: 'array',
          maxRows: 4,
          fields: [
            { name: 'title', label: 'タイトル', type: 'text', required: true },
            { name: 'description', label: '説明', type: 'textarea' },
          ],
        },
      ],
    },
    {
      name: 'companyProfile',
      label: '会社情報',
      type: 'group',
      fields: [
        { name: 'enabled', label: '表示する', type: 'checkbox', defaultValue: true },
        { name: 'heading', label: '見出し', type: 'text' },
        {
          name: 'rows',
          label: '情報一覧',
          type: 'array',
          fields: [
            { name: 'label', label: '項目名', type: 'text', required: true },
            { name: 'value', label: '内容', type: 'textarea', required: true },
          ],
        },
      ],
    },
    {
      name: 'members',
      label: 'メンバー紹介',
      type: 'group',
      fields: [
        { name: 'enabled', label: '表示する', type: 'checkbox', defaultValue: true },
        { name: 'heading', label: '見出し', type: 'text' },
        {
          name: 'items',
          label: 'メンバー一覧',
          type: 'array',
          maxRows: 8,
          fields: [
            { name: 'name', label: '氏名', type: 'text', required: true },
            { name: 'position', label: '役職・肩書', type: 'text' },
            { name: 'bio', label: '自己紹介', type: 'textarea' },
            { name: 'image', label: '写真', type: 'upload', relationTo: 'media' },
          ],
        },
      ],
    },
  ],
  versions: { drafts: true },
}
