/**
 * @vitest-environment jsdom
 */
import { fireEvent, render } from '@testing-library/react'
import React from 'react'
import { describe, expect, it, vi } from 'vite-plus/test'

import { Button } from '@/project/shared/components/button'

describe('Button', () => {
  it('デフォルトで type="button" の <button> を描画する', () => {
    const { getByRole } = render(<Button>送信</Button>)
    const button = getByRole('button', { name: '送信' })
    expect(button.tagName).toBe('BUTTON')
    expect(button.getAttribute('type')).toBe('button')
  })

  it('type="submit" を渡すと type="submit" の <button> になる', () => {
    const { getByRole } = render(<Button type="submit">確定</Button>)
    expect(getByRole('button', { name: '確定' }).getAttribute('type')).toBe('submit')
  })

  it('disabled を渡すとボタンが無効化される', () => {
    const { getByRole } = render(<Button disabled>無効</Button>)
    const button = getByRole('button', { name: '無効' })
    expect(button.hasAttribute('disabled')).toBe(true)
  })

  it('クリックすると onClick が発火する', () => {
    const onClick = vi.fn()
    const { getByRole } = render(<Button onClick={onClick}>クリック</Button>)
    fireEvent.click(getByRole('button', { name: 'クリック' }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('variant="primary" のとき bg-brand を含むクラスが付与される', () => {
    const { getByRole } = render(<Button variant="primary">主要</Button>)
    expect(getByRole('button', { name: '主要' }).className).toContain('bg-brand')
  })

  it('href を渡すと <button> ではなくリンク (role="link") を描画する', () => {
    const { getByRole, queryByRole } = render(<Button href="/contact">お問い合わせ</Button>)
    const link = getByRole('link', { name: 'お問い合わせ' })
    expect(link.getAttribute('href')).toBe('/contact')
    expect(queryByRole('button')).toBeNull()
  })

  it('href + disabled なリンクは aria-disabled とクリック抑止を設定する', () => {
    const { getByRole } = render(
      <Button href="/contact" disabled>
        送信中
      </Button>,
    )
    const link = getByRole('link', { name: '送信中' })
    expect(link.getAttribute('aria-disabled')).toBe('true')
    expect(link.getAttribute('tabindex')).toBe('-1')
    // クリックがブロックされること (preventDefault が呼ばれる)。
    const event = new MouseEvent('click', { bubbles: true, cancelable: true })
    link.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(true)
  })
})
