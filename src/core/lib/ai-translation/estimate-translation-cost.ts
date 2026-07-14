import type { TranslationModel } from '@/core/lib/ai-translation/translation-models'

type Props = {
  model: TranslationModel
  inputTokens: number
  outputTokens: number
}

/**
 * トークン数と単価表から API 費用（USD）を概算する。監査ログと月間上限判定に使う。
 */
export function estimateTranslationCost(props: Props): number {
  const inputCost = (props.inputTokens / 1_000_000) * props.model.inputCostUsdPerMTok
  const outputCost = (props.outputTokens / 1_000_000) * props.model.outputCostUsdPerMTok

  return Math.round((inputCost + outputCost) * 10000) / 10000
}
