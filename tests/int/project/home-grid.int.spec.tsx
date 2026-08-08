// @vitest-environment jsdom

import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { News } from '@/payload-types'
import { HomeGrid } from '@/project/pages/home/sections/home-grid'

vi.mock('@/project/shared/components/generative-canvas', () => ({
  GenerativeCanvas: () => <div data-testid="generative-canvas" />,
}))

const newsItem = {
  id: 1,
  title: 'CMSのお知らせタイトル',
  slug: 'cms-news',
  category: 'info',
  publishedAt: '2026-08-08T00:00:00.000Z',
  _status: 'published',
} as unknown as News

describe('HomeGrid', () => {
  it('CMSで設定したトップページの各フィールドを表示する', () => {
    render(
      <HomeGrid
        locale="ja"
        isDraft={false}
        hero={{
          enabled: true,
          title: 'CMSヒーロータイトル',
          subtitle: 'CMSヒーローサブタイトル',
          ctaLabel: 'CMSヒーローボタン',
          ctaHref: '/service',
        }}
        services={{
          enabled: true,
          heading: 'CMSサービス見出し',
          subheading: 'CMSサービスサブ見出し',
          items: [{ icon: '🧪', title: 'CMSサービス', description: 'CMSサービス説明' }],
        }}
        about={{
          enabled: true,
          heading: 'CMS会社紹介見出し',
          description: 'CMS会社紹介説明',
          ctaLabel: 'CMS会社紹介ボタン',
          ctaHref: '/about',
        }}
        works={[]}
        news={{ enabled: true, heading: 'CMSニュース見出し', items: [newsItem] }}
        cta={{
          enabled: true,
          heading: 'CMS CTA見出し',
          description: 'CMS CTA説明',
          ctaLabel: 'CMS CTAボタン',
          ctaHref: '/contact',
        }}
      />,
    )

    for (const text of [
      'CMSヒーロータイトル',
      'CMSヒーローサブタイトル',
      'CMSヒーローボタン',
      'CMSサービス見出し',
      'CMSサービスサブ見出し',
      'CMSサービス',
      'CMSサービス説明',
      'CMS会社紹介見出し',
      'CMS会社紹介説明',
      'CMS会社紹介ボタン',
      'CMSニュース見出し',
      'CMSのお知らせタイトル',
      'CMS CTA見出し',
      'CMS CTA説明',
      'CMS CTAボタン',
    ]) {
      expect(screen.getByText(text)).toBeTruthy()
    }
  })

  it('CMSで非表示にしたセクションを描画しない', () => {
    render(
      <HomeGrid
        locale="ja"
        isDraft={false}
        hero={{ enabled: false, title: '非表示ヒーロー' }}
        services={{ enabled: false, heading: '非表示サービス' }}
        about={{ enabled: false, heading: '非表示会社紹介' }}
        works={[]}
        news={{ enabled: false, heading: '非表示ニュース', items: [newsItem] }}
        cta={{ enabled: false, heading: '非表示CTA' }}
      />,
    )

    for (const text of [
      '非表示ヒーロー',
      '非表示サービス',
      '非表示会社紹介',
      '非表示ニュース',
      '非表示CTA',
    ]) {
      expect(screen.queryByText(text)).toBeNull()
    }
  })

  it('公開表示では下書きのお知らせを描画せず、プレビューでは描画する', () => {
    const draftNews = {
      ...newsItem,
      id: 2,
      title: '下書きのお知らせ',
      slug: 'draft-news',
      _status: 'draft',
    } as News
    const sharedProps = {
      locale: 'ja' as const,
      hero: { enabled: false, title: '非表示ヒーロー' },
      services: { enabled: false },
      about: { enabled: false },
      works: [],
      news: { enabled: true, items: [draftNews] },
      cta: { enabled: false },
    }
    const { rerender } = render(<HomeGrid {...sharedProps} isDraft={false} />)

    expect(screen.queryByText(draftNews.title)).toBeNull()

    rerender(<HomeGrid {...sharedProps} isDraft />)
    expect(screen.getByText(draftNews.title)).toBeTruthy()
  })
})
