import type { SiteSetting } from '@/payload-types'

// Storybook / テスト用のサンプルサイト設定。
export const exampleSiteSettings: SiteSetting = {
  id: 1,
  siteName: 'サンプル株式会社',
  logo: null,
  footerText: '誠実なものづくりで社会に貢献します。',
  companyInfo: {
    address: '東京都千代田区サンプル 1-2-3',
    tel: '03-1234-5678',
    fax: '03-1234-5679',
  },
  headerNav: [
    { label: '会社概要', href: '/about', id: 'h1' },
    { label: 'サービス', href: '/service', id: 'h2' },
    { label: 'お知らせ', href: '/news', id: 'h3' },
  ],
  footerNav: [
    { label: '会社概要', href: '/about', id: 'f1' },
    { label: 'お知らせ', href: '/news', id: 'f2' },
    { label: 'よくある質問', href: '/faq', id: 'f3' },
  ],
  policyLinks: [{ label: 'プライバシーポリシー', href: '/privacy', id: 'p1' }],
  social: {
    twitter: 'https://x.com/example',
    facebook: null,
    instagram: 'https://instagram.com/example',
    youtube: null,
  },
  analytics: { gaTagId: null, gtmId: null },
  turnstileSiteKey: null,
  updatedAt: '2026-01-01T00:00:00.000Z',
  createdAt: '2026-01-01T00:00:00.000Z',
}
