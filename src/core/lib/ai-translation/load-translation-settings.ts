import type { Payload } from 'payload'

import { resolveTranslationModel } from '@/core/lib/ai-translation/resolve-translation-model'
import type { TranslationModel } from '@/core/lib/ai-translation/translation-models'
import type { UsageLimits } from '@/core/lib/ai-translation/translation-types'

type TranslationSettings = {
  model: TranslationModel
  limits: UsageLimits
}

/**
 * AI翻訳設定を読み込む。enabled でなければ Error（管理画面のオフ操作が即時に効く）。
 * 未保存の Global でも安全なようにデフォルト値で補完する。
 */
export async function loadTranslationSettings(
  payload: Payload,
): Promise<TranslationSettings | Error> {
  const settingsGlobal = await payload.findGlobal({ slug: 'ai-translation-settings', depth: 0 })

  if (settingsGlobal.enabled !== true) {
    return new Error('AI翻訳は現在無効です。管理者は「AI翻訳設定」から有効化できます')
  }

  const model = resolveTranslationModel(settingsGlobal.model)

  if (model instanceof Error) return model

  const limits = settingsGlobal.limits

  return {
    model,
    limits: {
      monthlyRunLimit: limits?.monthlyRunLimit ?? 100,
      monthlyCharacterLimit: limits?.monthlyCharacterLimit ?? 300000,
      monthlyCostLimitUsd: limits?.monthlyCostLimitUsd ?? 10,
      perRunCharacterLimit: limits?.perRunCharacterLimit ?? 20000,
      cooldownSeconds: limits?.cooldownSeconds ?? 30,
    },
  }
}
