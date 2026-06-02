import type { GlobalConfig } from 'payload'

import { isAdmin } from '@/core/lib/access/is-admin'

export const siteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'サイト設定',
  admin: {
    group: 'システム',
  },
  access: {
    // フロントから取得するため read は public。更新は admin のみ（サイト全体設定の事故防止）。
    read: () => true,
    update: isAdmin,
  },
  fields: [
    {
      name: 'siteName',
      label: 'サイト名',
      type: 'text',
      required: true,
    },
    {
      name: 'logo',
      label: 'ロゴ画像',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'footerText',
      label: 'フッターテキスト',
      type: 'textarea',
    },
    {
      name: 'companyInfo',
      label: '会社情報',
      type: 'group',
      fields: [
        { name: 'address', label: '住所', type: 'text' },
        { name: 'tel', label: 'TEL', type: 'text' },
        { name: 'fax', label: 'FAX', type: 'text' },
      ],
    },
    {
      name: 'headerNav',
      label: 'ヘッダーナビゲーション',
      type: 'array',
      admin: {
        description:
          '表示順で並べる。href は `/about` のような絶対パス、外部 URL なら https:// から書く',
      },
      fields: [
        { name: 'label', label: 'ラベル', type: 'text', required: true },
        { name: 'href', label: 'リンク', type: 'text', required: true },
      ],
    },
    {
      name: 'footerNav',
      label: 'フッターナビゲーション',
      type: 'array',
      fields: [
        { name: 'label', label: 'ラベル', type: 'text', required: true },
        { name: 'href', label: 'リンク', type: 'text', required: true },
      ],
    },
    {
      name: 'policyLinks',
      label: 'ポリシー系リンク',
      type: 'array',
      admin: {
        description:
          'プライバシーポリシー、特定商取引法、サイトマップなど、フッター下部に出すリンク',
      },
      fields: [
        { name: 'label', label: 'ラベル', type: 'text', required: true },
        { name: 'href', label: 'リンク', type: 'text', required: true },
      ],
    },
    {
      name: 'social',
      label: 'SNS リンク',
      type: 'group',
      fields: [
        { name: 'twitter', label: 'Twitter/X URL', type: 'text' },
        { name: 'facebook', label: 'Facebook URL', type: 'text' },
        { name: 'instagram', label: 'Instagram URL', type: 'text' },
        { name: 'youtube', label: 'YouTube URL', type: 'text' },
      ],
    },
    {
      name: 'analytics',
      label: '解析タグ',
      type: 'group',
      fields: [
        { name: 'gaTagId', label: 'Google Analytics タグ ID', type: 'text' },
        { name: 'gtmId', label: 'Google Tag Manager ID', type: 'text' },
      ],
    },
    {
      name: 'turnstileSiteKey',
      label: 'Cloudflare Turnstile サイトキー',
      type: 'text',
      admin: {
        description: '問い合わせフォームのスパム対策用',
      },
    },
  ],
}
