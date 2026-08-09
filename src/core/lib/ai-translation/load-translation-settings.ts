import type { Payload } from "payload"

import { resolveEffectiveUsageLimits } from "@/core/lib/ai-translation/resolve-effective-usage-limits"
import { resolveTranslationModel } from "@/core/lib/ai-translation/resolve-translation-model"
import type { TranslationModel } from "@/core/lib/ai-translation/translation-models"
import type { UsageLimits } from "@/core/lib/ai-translation/translation-types"

type TranslationSettings = {
  model: TranslationModel
  limits: UsageLimits
}

/**
 * AI翻訳設定を読み込む。enabled でなければ Error（管理画面のオフ操作が即時に効く）。
 * 上限は管理画面の設定値と環境変数の天井（実装側ガード）の小さい方を採用する。
 */
export async function loadTranslationSettings(
  payload: Payload,
): Promise<TranslationSettings | Error> {
  const settingsGlobal = await payload.findGlobal({ slug: "ai-translation-settings", depth: 0 })

  if (settingsGlobal.enabled !== true) {
    return new Error("AI翻訳は現在無効です。管理者は「AI翻訳設定」から有効化できます")
  }

  const model = resolveTranslationModel(settingsGlobal.model)

  if (model instanceof Error) return model

  return {
    model,
    limits: resolveEffectiveUsageLimits({ limitsGroup: settingsGlobal.limits, env: process.env }),
  }
}
