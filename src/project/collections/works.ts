import type { CollectionConfig } from 'payload'
import { MetaDescriptionField, MetaImageField, MetaTitleField } from '@payloadcms/plugin-seo/fields'

import { isAdmin } from '@/core/lib/access/is-admin'
import { isAuthenticated } from '@/core/lib/access/is-authenticated'
import { buildCollectionRevalidateAfterChange } from '@/core/lib/revalidate/build-collection-revalidate-after-change'
import { buildCollectionRevalidateAfterDelete } from '@/core/lib/revalidate/build-collection-revalidate-after-delete'

type WorkDoc = { slug?: string }

const resolvePaths = ({ doc }: { doc: WorkDoc }): string[] => {
  const paths = ['/', '/works']
  if (doc.slug) paths.push(`/works/${doc.slug}`)
  return paths
}

export const works: CollectionConfig = {
  slug: 'works',
  labels: {
    singular: '制作実績',
    plural: '制作実績一覧',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'publishedAt', 'updatedAt'],
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
      admin: {
        description: '半角英数字とハイフンのみ。URL に使います。',
      },
    },
    {
      name: 'category',
      label: 'カテゴリ',
      type: 'select',
      required: true,
      defaultValue: 'web',
      options: [
        { label: 'Webデザイン', value: 'web' },
        { label: 'プロダクト', value: 'product' },
        { label: 'モバイル', value: 'mobile' },
        { label: 'フロントエンド', value: 'frontend' },
        { label: 'ブランディング', value: 'branding' },
      ],
    },
    {
      name: 'publishedAt',
      label: '公開日',
      type: 'date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayOnly',
          displayFormat: 'yyyy-MM-dd',
        },
      },
    },
    {
      name: 'thumbnail',
      label: 'サムネイル画像',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'summary',
      label: '概要',
      type: 'textarea',
    },
    {
      name: 'body',
      label: '本文',
      type: 'richText',
    },
    {
      // seoPlugin は core 設定で対象コレクションが固定されているため、
      // works は plugin-seo のフィールドヘルパーで同じ構造 (meta.title/description/image) を持たせる。
      name: 'meta',
      label: 'SEO',
      type: 'group',
      fields: [
        MetaTitleField({ hasGenerateFn: false }),
        MetaDescriptionField({ hasGenerateFn: false }),
        MetaImageField({ relationTo: 'media' }),
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
    afterChange: [buildCollectionRevalidateAfterChange<WorkDoc>(resolvePaths)],
    afterDelete: [buildCollectionRevalidateAfterDelete<WorkDoc>(resolvePaths)],
  },
}
