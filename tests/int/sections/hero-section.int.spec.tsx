/**
 * @vitest-environment jsdom
 */
import { render } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from 'vitest'

import { HeroSection } from '@/core/sections/hero-section'

describe('HeroSection', () => {
  it('enabled=true のとき見出しを描画する', () => {
    const { getByRole } = render(
      <HeroSection
        data={{
          enabled: true,
          title: 'ようこそ',
          subtitle: '私たちについて',
          image: null,
          ctaLabel: '詳細を見る',
          ctaHref: '/about',
        }}
      />,
    )
    expect(getByRole('heading', { level: 1 }).textContent).toBe('ようこそ')
  })

  it('enabled=false のとき何も描画しない', () => {
    const { container } = render(
      <HeroSection
        data={{
          enabled: false,
          title: 'ようこそ',
          subtitle: '',
          image: null,
          ctaLabel: '',
          ctaHref: '',
        }}
      />,
    )
    expect(container.firstChild).toBeNull()
  })
})
