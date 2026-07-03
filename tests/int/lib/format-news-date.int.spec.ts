import { describe, expect, it } from 'vite-plus/test'

import { formatNewsDate } from '@/core/lib/format-news-date'

describe('formatNewsDate', () => {
  it('null を渡すと null を返す', () => {
    expect(formatNewsDate(null, 'ja')).toBeNull()
  })

  it('undefined を渡すと null を返す', () => {
    expect(formatNewsDate(undefined, 'ja')).toBeNull()
  })

  it('空文字を渡すと null を返す', () => {
    expect(formatNewsDate('', 'ja')).toBeNull()
  })

  it('日付として解釈できない文字列は null を返す', () => {
    expect(formatNewsDate('not-a-date', 'ja')).toBeNull()
  })

  it('有効な ISO 日付は dateTime と label を持つオブジェクトを返す (ja)', () => {
    const result = formatNewsDate('2026-06-25T00:00:00.000Z', 'ja')

    expect(result).not.toBeNull()
    expect(result?.dateTime).toBe('2026-06-25')
    expect(typeof result?.label).toBe('string')
    expect(result?.label.length).toBeGreaterThan(0)
    expect(result?.label).toContain('2026')
  })

  it('有効な ISO 日付は dateTime と label を持つオブジェクトを返す (en)', () => {
    const result = formatNewsDate('2026-06-25T00:00:00.000Z', 'en')

    expect(result).not.toBeNull()
    expect(result?.dateTime).toBe('2026-06-25')
    expect(typeof result?.label).toBe('string')
    expect(result?.label.length).toBeGreaterThan(0)
    expect(result?.label).toContain('2026')
  })

  it('返り値は dateTime と label の 2 キーだけを持つ', () => {
    const result = formatNewsDate('2026-06-25T00:00:00.000Z', 'ja')

    expect(result).not.toBeNull()
    expect(Object.keys(result ?? {}).sort()).toEqual(['dateTime', 'label'])
  })
})
