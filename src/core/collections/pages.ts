import type { CollectionConfig } from 'payload'

import { isAdmin } from '@/core/lib/access/is-admin'
import { isAuthenticated } from '@/core/lib/access/is-authenticated'
import {
  buildCollectionRevalidateAfterChange,
  buildCollectionRevalidateAfterDelete,
} from '@/core/lib/revalidate/build-revalidate-hooks'

type PageDoc = { slug?: string }

const resolvePaths = ({ doc }: { doc: PageDoc }): string[] => {
  if (!doc.slug) return []
  return [`/${doc.slug}`]
}

export const pages: CollectionConfig = {
  slug: 'pages',
  labels: {
    singular: 'ページ',
    plural: 'ページ一覧',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'updatedAt'],
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
      name: 'title',
      label: 'タイトル',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      label: 'スラッグ',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'body',
      label: '本文',
      type: 'richText',
    },
    {
      name: 'meta',
      label: 'SEO 設定',
      type: 'group',
      fields: [
        { name: 'title', label: 'メタタイトル', type: 'text' },
        { name: 'description', label: 'メタ説明', type: 'textarea' },
      ],
    },
  ],
  versions: {
    drafts: {
      autosave: {
        interval: 2000,
      },
    },
  },
  hooks: {
    afterChange: [buildCollectionRevalidateAfterChange<PageDoc>(resolvePaths)],
    afterDelete: [buildCollectionRevalidateAfterDelete<PageDoc>(resolvePaths)],
  },
}
