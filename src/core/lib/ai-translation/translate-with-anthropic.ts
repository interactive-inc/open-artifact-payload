import { buildTranslationPrompt } from '@/core/lib/ai-translation/build-translation-prompt'
import { parseTranslationResponse } from '@/core/lib/ai-translation/parse-translation-response'
import type { TranslateFn } from '@/core/lib/ai-translation/translation-types'

/**
 * Anthropic Messages API で翻訳する。SDK は追加せず fetch 直（Workers 互換・依存最小）。
 * 接続先は AI_TRANSLATION_ANTHROPIC_API_URL で差し替え可能（Cloudflare AI Gateway 経由など）。
 * 失敗は throw せず Error で返し、呼び出し側で既存データを守る。
 */
export const translateWithAnthropic: TranslateFn = async (request) => {
  const apiUrl =
    process.env.AI_TRANSLATION_ANTHROPIC_API_URL ?? 'https://api.anthropic.com/v1/messages'

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': request.apiKey,
        'anthropic-version': '2023-06-01',
      },
      signal: AbortSignal.timeout(90000),
      body: JSON.stringify({
        model: request.modelId,
        max_tokens: request.maxOutputTokens,
        temperature: 0,
        system: buildTranslationPrompt({
          sourceLocaleLabel: request.sourceLocaleLabel,
          targetLocaleLabel: request.targetLocaleLabel,
        }),
        messages: [{ role: 'user', content: JSON.stringify({ units: request.units }) }],
      }),
    })

    if (!response.ok) {
      const errorBody = await response.text()

      return new Error(`Anthropic API エラー (${response.status}): ${errorBody.slice(0, 300)}`)
    }

    const responseBody: unknown = await response.json()

    if (!responseBody || typeof responseBody !== 'object') {
      return new Error('Anthropic API の応答形式が不正です')
    }

    const content = 'content' in responseBody ? responseBody.content : null
    const firstBlock: unknown = Array.isArray(content) ? content[0] : null
    const rawText =
      firstBlock &&
      typeof firstBlock === 'object' &&
      'text' in firstBlock &&
      typeof firstBlock.text === 'string'
        ? firstBlock.text
        : null

    if (rawText === null) return new Error('Anthropic API の応答にテキストがありません')

    const translations = parseTranslationResponse({ rawText, expectedCount: request.units.length })

    if (translations instanceof Error) return translations

    const usage =
      'usage' in responseBody && responseBody.usage && typeof responseBody.usage === 'object'
        ? responseBody.usage
        : null
    const inputTokens =
      usage && 'input_tokens' in usage && typeof usage.input_tokens === 'number'
        ? usage.input_tokens
        : 0
    const outputTokens =
      usage && 'output_tokens' in usage && typeof usage.output_tokens === 'number'
        ? usage.output_tokens
        : 0

    return { translations, inputTokens, outputTokens }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)

    return new Error(`Anthropic API の呼び出しに失敗しました: ${message}`)
  }
}
