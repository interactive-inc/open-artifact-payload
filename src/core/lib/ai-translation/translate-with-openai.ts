import { buildTranslationPrompt } from "@/core/lib/ai-translation/build-translation-prompt"
import { parseTranslationResponse } from "@/core/lib/ai-translation/parse-translation-response"
import type { TranslateFn } from "@/core/lib/ai-translation/translation-types"

/**
 * OpenAI Chat Completions API で翻訳する。SDK は追加せず fetch 直（Workers 互換・依存最小）。
 * 接続先は AI_TRANSLATION_OPENAI_API_URL で差し替え可能（Cloudflare AI Gateway 経由など）。
 * 応答が返った時点で課金は確定しているため、内容が不正でも使用量は TranslateFailure で返し
 * 監査ログの実費集計から漏らさない。通信エラー等は Error で返す。
 */
export const translateWithOpenai: TranslateFn = async (request) => {
  const apiUrl =
    process.env.AI_TRANSLATION_OPENAI_API_URL ?? "https://api.openai.com/v1/chat/completions"

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${request.apiKey}`,
      },
      signal: AbortSignal.timeout(90000),
      body: JSON.stringify({
        model: request.modelId,
        temperature: 0,
        max_completion_tokens: request.maxOutputTokens,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: buildTranslationPrompt({
              sourceLocaleLabel: request.sourceLocaleLabel,
              targetLocaleLabel: request.targetLocaleLabel,
            }),
          },
          { role: "user", content: JSON.stringify({ units: request.units }) },
        ],
      }),
    })

    if (!response.ok) {
      const errorBody = await response.text()

      return new Error(`OpenAI API エラー (${response.status}): ${errorBody.slice(0, 300)}`)
    }

    const responseBody: unknown = await response.json()

    if (!responseBody || typeof responseBody !== "object") {
      return new Error("OpenAI API の応答形式が不正です")
    }

    const usage =
      "usage" in responseBody && responseBody.usage && typeof responseBody.usage === "object"
        ? responseBody.usage
        : null
    const inputTokens =
      usage && "prompt_tokens" in usage && typeof usage.prompt_tokens === "number"
        ? usage.prompt_tokens
        : 0
    const outputTokens =
      usage && "completion_tokens" in usage && typeof usage.completion_tokens === "number"
        ? usage.completion_tokens
        : 0

    const choices = "choices" in responseBody ? responseBody.choices : null
    const firstChoice: unknown = Array.isArray(choices) ? choices[0] : null
    const message =
      firstChoice && typeof firstChoice === "object" && "message" in firstChoice
        ? firstChoice.message
        : null
    const rawText =
      message &&
      typeof message === "object" &&
      "content" in message &&
      typeof message.content === "string"
        ? message.content
        : null

    if (rawText === null) {
      return {
        failureMessage: "OpenAI API の応答にテキストがありません",
        inputTokens,
        outputTokens,
      }
    }

    const translations = parseTranslationResponse({ rawText, expectedCount: request.units.length })

    if (translations instanceof Error) {
      return { failureMessage: translations.message, inputTokens, outputTokens }
    }

    return { translations, inputTokens, outputTokens }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)

    return new Error(`OpenAI API の呼び出しに失敗しました: ${message}`)
  }
}
