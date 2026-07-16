import { describe, expect, it } from 'vite-plus/test'

import { estimateTranslationCost } from '@/core/lib/ai-translation/estimate-translation-cost'
import { resolveTranslationModel } from '@/core/lib/ai-translation/resolve-translation-model'

describe('estimateTranslationCost', () => {
  it('入出力トークンから USD 費用を概算する', () => {
    const model = resolveTranslationModel('anthropic/claude-haiku-4-5')

    if (model instanceof Error) throw model

    // input $1/MTok, output $5/MTok → 100k input + 20k output = 0.1 + 0.1 = 0.2
    const cost = estimateTranslationCost({ model, inputTokens: 100000, outputTokens: 20000 })

    expect(cost).toBeCloseTo(0.2, 4)
  })

  it('小さなトークン数でも 0 にならず小数第4位で丸める', () => {
    const model = resolveTranslationModel('anthropic/claude-haiku-4-5')

    if (model instanceof Error) throw model

    const cost = estimateTranslationCost({ model, inputTokens: 500, outputTokens: 100 })

    expect(cost).toBe(0.001)
  })
})
