import { afterEach, describe, expect, it, vi } from 'vite-plus/test'

import { translateWithAnthropic } from '@/core/lib/ai-translation/translate-with-anthropic'
import type { TranslateRequest } from '@/core/lib/ai-translation/translation-types'

const request: TranslateRequest = {
  units: ['こんにちは'],
  sourceLocaleLabel: '日本語',
  targetLocaleLabel: 'English',
  modelId: 'claude-haiku-4-5',
  apiKey: 'test-key',
  maxOutputTokens: 2000,
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

describe('translateWithAnthropic', () => {
  it('Messages API を呼び、応答を検証して返す', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          content: [{ type: 'text', text: '{"translations": ["Hello"]}' }],
          usage: { input_tokens: 100, output_tokens: 20 },
        }),
        { status: 200 },
      ),
    )

    vi.stubGlobal('fetch', fetchMock)

    const outcome = await translateWithAnthropic(request)

    if (outcome instanceof Error) throw outcome

    expect(outcome.translations).toEqual(['Hello'])
    expect(outcome.inputTokens).toBe(100)
    expect(outcome.outputTokens).toBe(20)

    const [url, init] = fetchMock.mock.calls[0] as [string, { body: string }]

    expect(url).toBe('https://api.anthropic.com/v1/messages')

    const body = JSON.parse(init.body) as Record<string, unknown>

    expect(body.model).toBe('claude-haiku-4-5')
    expect(body.temperature).toBe(0)
    // ユーザー入力は units の JSON のみ。自由なプロンプトは送らない
    expect(body.messages).toEqual([
      { role: 'user', content: JSON.stringify({ units: ['こんにちは'] }) },
    ])
    expect(String(body.system)).toContain('翻訳')
    expect(String(body.system)).toContain('実行せず')
  })

  it('AI_TRANSLATION_ANTHROPIC_API_URL で接続先を差し替えられる（AI Gateway 用）', async () => {
    const gatewayUrl = 'https://gateway.ai.cloudflare.com/v1/acct/gw/anthropic/v1/messages'

    vi.stubEnv('AI_TRANSLATION_ANTHROPIC_API_URL', gatewayUrl)

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          content: [{ type: 'text', text: '{"translations": ["Hello"]}' }],
          usage: { input_tokens: 1, output_tokens: 1 },
        }),
        { status: 200 },
      ),
    )

    vi.stubGlobal('fetch', fetchMock)

    const outcome = await translateWithAnthropic(request)

    if (outcome instanceof Error) throw outcome

    expect(fetchMock.mock.calls[0]?.[0]).toBe(gatewayUrl)
  })

  it('非 200 応答は Error を返す', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('{"error": "overloaded"}', { status: 529 })),
    )

    const outcome = await translateWithAnthropic(request)

    expect(outcome).toBeInstanceOf(Error)
    if (outcome instanceof Error) expect(outcome.message).toContain('529')
  })

  it('fetch 例外は Error に変換する', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')))

    const outcome = await translateWithAnthropic(request)

    expect(outcome).toBeInstanceOf(Error)
  })
})
