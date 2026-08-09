import { translateWithAnthropic } from "@/core/lib/ai-translation/translate-with-anthropic"
import { translateWithOpenai } from "@/core/lib/ai-translation/translate-with-openai"
import type { TranslateFn } from "@/core/lib/ai-translation/translation-types"

/**
 * プロバイダ名から翻訳実装を解決する。プロバイダを追加する場合はここと
 * translation-models.ts の両方に登録する。
 */
export function resolveTranslateFn(provider: "anthropic" | "openai"): TranslateFn {
  if (provider === "anthropic") return translateWithAnthropic

  return translateWithOpenai
}
