import { describe, expect, it } from 'vite-plus/test'

import { getValueAtPath } from '@/core/lib/ai-translation/get-value-at-path'
import { setValueAtPath } from '@/core/lib/ai-translation/set-value-at-path'

describe('getValueAtPath', () => {
  it('ネストしたオブジェクトと配列を辿れる', () => {
    const doc = { companyInfo: { address: '東京' }, headerNav: [{ label: 'ホーム' }] }

    expect(getValueAtPath(doc, ['companyInfo', 'address'])).toBe('東京')
    expect(getValueAtPath(doc, ['headerNav', 0, 'label'])).toBe('ホーム')
  })

  it('存在しないパスは undefined を返す', () => {
    expect(getValueAtPath({ a: 1 }, ['b', 'c'])).toBeUndefined()
    expect(getValueAtPath(null, ['a'])).toBeUndefined()
  })
})

describe('setValueAtPath', () => {
  it('ネスト先へ値を書き込める', () => {
    const doc = { headerNav: [{ label: 'ホーム' }] }

    const isSet = setValueAtPath(doc, ['headerNav', 0, 'label'], 'Home')

    expect(isSet).toBe(true)
    expect(doc.headerNav[0]?.label).toBe('Home')
  })

  it('親が存在しない場合は false を返し何もしない', () => {
    const doc = { headerNav: null }

    const isSet = setValueAtPath(doc, ['headerNav', 0, 'label'], 'Home')

    expect(isSet).toBe(false)
    expect(doc.headerNav).toBeNull()
  })
})
