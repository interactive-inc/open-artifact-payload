import { describe, expect, test } from 'vite-plus/test'

import { SiteResourceSlug } from '../domain/site-resource-slug'
import { PayloadRestClient } from './payload-rest-client'

describe('PayloadRestClient', () => {
  test('uses Payload API Key authentication and collection query parameters', async () => {
    let requestedUrl: string | null = null
    let requestedAuthorization: string | null = null

    const client = new PayloadRestClient({
      endpoint: 'https://example.com',
      authentication: { kind: 'api-key', apiKey: 'secret-key', authCollection: 'users' },
      fetchPort: async (input, init) => {
        requestedUrl = input instanceof Request ? input.url : String(input)
        requestedAuthorization = new Headers(init.headers).get('Authorization')
        return new Response(JSON.stringify({ docs: [], totalDocs: 0 }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      },
    })
    const slug = SiteResourceSlug.create('news')
    expect(slug).not.toBeInstanceOf(Error)
    if (slug instanceof Error) return

    const result = await client.listCollection({
      slug,
      limit: 25,
      page: 2,
      locale: 'ja',
      draft: true,
      depth: 1,
    })

    expect(result).not.toBeInstanceOf(Error)
    expect(requestedAuthorization).toBe('users API-Key secret-key')
    expect(requestedUrl).toBe(
      'https://example.com/api/news?limit=25&page=2&draft=true&depth=1&locale=ja',
    )
  })

  test('returns PayloadApiError instead of throwing for non-success responses', async () => {
    const client = new PayloadRestClient({
      endpoint: 'https://example.com',
      authentication: { kind: 'api-key', apiKey: 'secret-key', authCollection: 'users' },
      fetchPort: async () =>
        new Response(JSON.stringify({ message: 'Forbidden' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }),
    })
    const slug = SiteResourceSlug.create('news')
    expect(slug).not.toBeInstanceOf(Error)
    if (slug instanceof Error) return

    const result = await client.listCollection({
      slug,
      limit: 10,
      page: 1,
      locale: null,
      draft: false,
      depth: 0,
    })

    expect(result).toBeInstanceOf(Error)
    if (!(result instanceof Error)) return
    expect(result.message).toContain('HTTP 403')
  })

  test('updates Payload globals with POST and a JSON body', async () => {
    let requestedMethod = ''
    let requestedBody = ''
    let requestedUrl = ''
    const client = new PayloadRestClient({
      endpoint: 'https://example.com',
      authentication: { kind: 'api-key', apiKey: 'secret-key', authCollection: 'users' },
      fetchPort: async (input, init) => {
        requestedMethod = init.method ?? ''
        requestedBody = typeof init.body === 'string' ? init.body : ''
        requestedUrl = input instanceof Request ? input.url : String(input)
        return new Response(JSON.stringify({ siteName: 'Updated' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      },
    })
    const slug = SiteResourceSlug.create('site-settings')
    expect(slug).not.toBeInstanceOf(Error)
    if (slug instanceof Error) return

    const result = await client.updateGlobal({
      slug,
      locale: 'ja',
      draft: false,
      depth: 0,
      data: { siteName: 'Updated' },
    })

    expect(result).not.toBeInstanceOf(Error)
    expect(requestedMethod).toBe('POST')
    expect(requestedBody).toBe('{"siteName":"Updated"}')
    expect(requestedUrl).toBe(
      'https://example.com/api/globals/site-settings?draft=false&depth=0&locale=ja',
    )
  })

  test('uses Payload JWT authentication for interactive CLI sessions', async () => {
    let requestedAuthorization = ''
    const client = new PayloadRestClient({
      endpoint: 'https://example.com',
      authentication: { kind: 'jwt', token: 'session-token' },
      fetchPort: async (_input, init) => {
        requestedAuthorization = new Headers(init.headers).get('Authorization') ?? ''
        return Response.json({ docs: [], totalDocs: 0 })
      },
    })
    const slug = SiteResourceSlug.create('news')
    expect(slug).not.toBeInstanceOf(Error)
    if (slug instanceof Error) return

    const result = await client.listCollection({
      slug,
      limit: 10,
      page: 1,
      locale: null,
      draft: false,
      depth: 0,
    })

    expect(result).not.toBeInstanceOf(Error)
    expect(requestedAuthorization).toBe('JWT session-token')
  })
})
