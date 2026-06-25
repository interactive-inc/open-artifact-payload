import type { CollectionConfig } from 'payload'

import { isAdmin } from '@/core/lib/access/is-admin'
import { isAuthenticated } from '@/core/lib/access/is-authenticated'
import { publishedOrAuthenticated } from '@/core/lib/access/published-or-authenticated'
import { buildCollectionRevalidateAfterChange } from '@/core/lib/revalidate/build-collection-revalidate-after-change'
import { buildCollectionRevalidateAfterDelete } from '@/core/lib/revalidate/build-collection-revalidate-after-delete'

type NewsDoc = { slug?: string }

const resolvePaths = (props: { doc: NewsDoc }): string[] => {
  const paths = ['/news']
  if (props.doc.slug) paths.push(`/news/${props.doc.slug}`)
  return paths
}

export const news: CollectionConfig = {
  slug: 'news',
  labels: {
    singular: 'お知らせ',
    plural: 'お知らせ一覧',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'publishedAt', 'updatedAt'],
    group: 'コンテンツ',
  },
  access: {
    // 未ログイン訪問者には _status='published' のみ。エディタ/管理者は下書きも閲覧可。
    read: publishedOrAuthenticated,
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
      admin: {
        description: '半角英数字とハイフンのみ。URL に使います。',
      },
    },
    {
      name: 'publishedAt',
      label: '公開日',
      type: 'date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
          displayFormat: 'yyyy-MM-dd HH:mm',
        },
      },
    },
    {
      name: 'category',
      label: 'カテゴリ',
      type: 'select',
      required: true,
      defaultValue: 'info',
      options: [
        { label: 'お知らせ', value: 'info' },
        { label: 'プレスリリース', value: 'press' },
        { label: 'イベント', value: 'event' },
      ],
    },
    {
      name: 'thumbnail',
      label: 'サムネイル画像',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'body',
      label: '本文',
      type: 'richText',
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
    afterChange: [buildCollectionRevalidateAfterChange<NewsDoc>(resolvePaths)],
    afterDelete: [buildCollectionRevalidateAfterDelete<NewsDoc>(resolvePaths)],
  },
}
