import type { CollectionConfig } from 'payload'

import { isAdmin } from '@/core/lib/access/is-admin'
import { isAuthenticated } from '@/core/lib/access/is-authenticated'

export const faq: CollectionConfig = {
  slug: 'faq',
  labels: {
    singular: 'よくある質問',
    plural: 'よくある質問一覧',
  },
  admin: {
    useAsTitle: 'question',
    defaultColumns: ['question', 'category', 'order', 'updatedAt'],
    group: 'コンテンツ',
  },
  access: {
    read: () => true,
    create: isAuthenticated,
    update: isAuthenticated,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'question',
      label: '質問',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'answer',
      label: '回答',
      type: 'textarea',
      required: true,
      localized: true,
    },
    {
      name: 'category',
      label: 'カテゴリ',
      type: 'select',
      defaultValue: 'general',
      options: [
        { label: '全般', value: 'general' },
        { label: 'サービス', value: 'service' },
        { label: '料金', value: 'pricing' },
        { label: 'その他', value: 'other' },
      ],
    },
    {
      name: 'order',
      label: '表示順',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: '数値が小さい順に表示されます',
      },
    },
  ],
}
