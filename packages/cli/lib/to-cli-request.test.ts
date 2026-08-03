import { describe, expect, test } from 'vite-plus/test'

import { toCliRequest } from './to-cli-request'

describe('toCliRequest', () => {
  test('maps argv to a flat CLI route and body', async () => {
    const result = toCliRequest(['collections', 'list', '--slug', 'news', '--limit=25', '--draft'])

    expect(result).not.toBeInstanceOf(Error)
    if (result instanceof Error) return
    expect(new URL(result.request.url).pathname).toBe('/collections/list')
    expect(await result.request.json()).toEqual({ slug: 'news', limit: '25', draft: 'true' })
  })

  test('rejects command path injection', () => {
    const result = toCliRequest(['../users'])

    expect(result).toBeInstanceOf(Error)
  })

  test('rejects missing values for non-boolean flags', () => {
    const result = toCliRequest(['collections', 'get', '--id'])

    expect(result).toBeInstanceOf(Error)
  })
})
