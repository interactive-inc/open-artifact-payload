/**
 * @vitest-environment jsdom
 */
import { render } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from 'vite-plus/test'

import { FeaturedNewsSection } from '@/core/sections/featured-news-section'
import { exampleNewsItems } from '@/core/test-support/example-news-items'

describe('FeaturedNewsSection', () => {
  it('enabled=false のとき何も描画しない', () => {
    const { container } = render(
      <FeaturedNewsSection data={{ enabled: false, items: exampleNewsItems }} />,
    )
    expect(container.firstChild).toBeNull()
  })

  it('enabled=true でも items が空配列なら何も描画しない', () => {
    const { container } = render(<FeaturedNewsSection data={{ enabled: true, items: [] }} />)
    expect(container.firstChild).toBeNull()
  })

  it('items が ID 数値のみ (populate 前) のときは除外され何も描画しない', () => {
    const { container } = render(<FeaturedNewsSection data={{ enabled: true, items: [1, 2] }} />)
    expect(container.firstChild).toBeNull()
  })

  it('populate 済みの items を渡すと全件のタイトルと /news/<slug> リンクを描画する', () => {
    const { getByText } = render(
      <FeaturedNewsSection data={{ enabled: true, items: exampleNewsItems }} />,
    )

    for (const item of exampleNewsItems) {
      const heading = getByText(item.title)
      expect(heading).not.toBeNull()
      const link = heading.closest('a')
      expect(link).not.toBeNull()
      expect(link?.getAttribute('href')).toBe(`/news/${item.slug}`)
    }
  })

  it('publishedAt が空文字でも例外を投げずタイトルを描画する (日付ガード)', () => {
    const itemWithoutDate = { ...exampleNewsItems[0], publishedAt: '' }
    const { getByText } = render(
      <FeaturedNewsSection data={{ enabled: true, items: [itemWithoutDate] }} />,
    )
    expect(getByText(itemWithoutDate.title)).not.toBeNull()
  })

  it('公開フロントでは _status=draft の記事は除外される', () => {
    const draft = { ...exampleNewsItems[0], _status: 'draft' as const, title: '下書き記事' }
    const published = { ...exampleNewsItems[1], _status: 'published' as const }
    const { queryByText, getByText } = render(
      <FeaturedNewsSection data={{ enabled: true, items: [draft, published] }} />,
    )
    expect(queryByText('下書き記事')).toBeNull()
    expect(getByText(published.title)).not.toBeNull()
  })

  it('showDrafts=true (ライブプレビュー) のときは下書き記事も描画する', () => {
    const draft = { ...exampleNewsItems[0], _status: 'draft' as const, title: '下書き記事' }
    const { getByText } = render(
      <FeaturedNewsSection data={{ enabled: true, items: [draft] }} showDrafts={true} />,
    )
    expect(getByText('下書き記事')).not.toBeNull()
  })
})
