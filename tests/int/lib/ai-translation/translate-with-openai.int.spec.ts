import { afterEach, describe, expect, it, vi } from 'vite-plus/test'

import { translateWithOpenai } from '@/core/lib/ai-translation/translate-with-openai'
import type { TranslateRequest } from '@/core/lib/ai-translation/translation-types'

const request: TranslateRequest = {
  units: ['こんにちは'],
  sourceLocaleLabel: '日本語',
  targetLocaleLabel: 'English',
  modelId: 'gpt-4o-mini',
  apiKey: 'test-key',
  maxOutputTokens: 2000,
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('translateWithOpenai', () => {
  it('Chat Completions API を呼び、応答を検証して返す', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          choices: [{ message: { content: '{"translations": ["Hello"]}' } }],
          usage: { prompt_tokens: 80, completion_tokens: 10 },
        }),
        { status: 200 },
      ),
    )

    vi.stubGlobal('fetch', fetchMock)

    const outcome = await translateWithOpenai(request)

    if (outcome instanceof Error) throw outcome

    expect(outcome.translations).toEqual(['Hello'])
    expect(outcome.inputTokens).toBe(80)
    expect(outcome.outputTokens).toBe(10)

    const [url, init] = fetchMock.mock.calls[0] as [string, { body: string }]

    expect(url).toBe('https://api.openai.com/v1/chat/completions')

    const body = JSON.parse(init.body) as Record<string, unknown>

    expect(body.model).toBe('gpt-4o-mini')
    expect(body.response_format).toEqual({ type: 'json_object' })

    const messages = body.messages as Array<Record<string, unknown>>

    expect(messages).toHaveLength(2)
    expect(messages[0]?.role).toBe('system')
    expect(messages[1]).toEqual({
      role: 'user',
      content: JSON.stringify({ units: ['こんにちは'] }),
    })
  })

  it('非 200 応答は Error を返す', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('{"error": "rate limit"}', { status: 429 })),
    )

    const outcome = await translateWithOpenai(request)

    expect(outcome).toBeInstanceOf(Error)
    if (outcome instanceof Error) expect(outcome.message).toContain('429')
  })
})
