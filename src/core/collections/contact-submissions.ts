import type { CollectionConfig } from 'payload'

import { isAdmin } from '@/core/lib/access/is-admin'
import { isAuthenticated } from '@/core/lib/access/is-authenticated'

export const contactSubmissions: CollectionConfig = {
  slug: 'contact-submissions',
  labels: {
    singular: '問い合わせ',
    plural: '問い合わせ一覧',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'status', 'createdAt'],
    group: 'コンテンツ',
  },
  access: {
    create: () => true,
    read: isAuthenticated,
    update: isAuthenticated,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'name',
      label: 'お名前',
      type: 'text',
      required: true,
    },
    {
      name: 'companyName',
      label: '会社名',
      type: 'text',
    },
    {
      name: 'email',
      label: 'メールアドレス',
      type: 'email',
      required: true,
    },
    {
      name: 'phone',
      label: '電話番号',
      type: 'text',
    },
    {
      name: 'inquiryType',
      label: 'お問い合わせ種別',
      type: 'text',
      admin: {
        description: '案件固有の選択肢がある場合、project 側で select フィールドに差し替えてから利用する',
      },
    },
    {
      name: 'message',
      label: '本文',
      type: 'textarea',
      required: true,
    },
    {
      name: 'status',
      label: '対応状況',
      type: 'select',
      required: true,
      defaultValue: 'new',
      options: [
        { label: '新着', value: 'new' },
        { label: '対応中', value: 'inProgress' },
        { label: '対応済み', value: 'done' },
      ],
    },
  ],
}
