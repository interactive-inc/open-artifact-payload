import { describe, expect, it } from 'vite-plus/test'

import { checkUsageLimits } from '@/core/lib/ai-translation/check-usage-limits'
import type { UsageLimits, UsageSnapshot } from '@/core/lib/ai-translation/translation-types'

const baseLimits: UsageLimits = {
  monthlyRunLimit: 100,
  monthlyCharacterLimit: 300000,
  monthlyCostLimitUsd: 10,
  perRunCharacterLimit: 20000,
  cooldownSeconds: 30,
}

const emptySnapshot: UsageSnapshot = {
  monthlyRunCount: 0,
  monthlyCharacterCount: 0,
  monthlyCostUsd: 0,
  lastRunAt: null,
}

const now = new Date('2026-07-15T03:00:00.000Z')

describe('checkUsageLimits', () => {
  it('上限内なら許可する', () => {
    const verdict = checkUsageLimits({
      snapshot: emptySnapshot,
      limits: baseLimits,
      requestedCharacterCount: 1000,
      projectedCostUsd: 0,
      now,
    })

    expect(verdict.allowed).toBe(true)
  })

  it('1回の文字数上限を超えると拒否する', () => {
    const verdict = checkUsageLimits({
      snapshot: emptySnapshot,
      limits: baseLimits,
      requestedCharacterCount: 20001,
      projectedCostUsd: 0,
      now,
    })

    expect(verdict.allowed).toBe(false)
    if (!verdict.allowed) expect(verdict.reason).toContain('20000')
  })

  it('月間実行回数上限に達していると拒否する', () => {
    const verdict = checkUsageLimits({
      snapshot: { ...emptySnapshot, monthlyRunCount: 100 },
      limits: baseLimits,
      requestedCharacterCount: 10,
      projectedCostUsd: 0,
      now,
    })

    expect(verdict.allowed).toBe(false)
    if (!verdict.allowed) expect(verdict.reason).toContain('回数')
  })

  it('月間文字数上限を超える場合は拒否する', () => {
    const verdict = checkUsageLimits({
      snapshot: { ...emptySnapshot, monthlyCharacterCount: 299995 },
      limits: baseLimits,
      requestedCharacterCount: 10,
      projectedCostUsd: 0,
      now,
    })

    expect(verdict.allowed).toBe(false)
    if (!verdict.allowed) expect(verdict.reason).toContain('文字数')
  })

  it('実績と今回の見込み費用の合算が月間費用上限を超えると拒否する', () => {
    const verdict = checkUsageLimits({
      snapshot: { ...emptySnapshot, monthlyCostUsd: 9.99 },
      limits: baseLimits,
      requestedCharacterCount: 10,
      projectedCostUsd: 0.02,
      now,
    })

    expect(verdict.allowed).toBe(false)
    if (!verdict.allowed) expect(verdict.reason).toContain('費用')

    const withinLimit = checkUsageLimits({
      snapshot: { ...emptySnapshot, monthlyCostUsd: 9.99 },
      limits: baseLimits,
      requestedCharacterCount: 10,
      projectedCostUsd: 0.005,
      now,
    })

    expect(withinLimit.allowed).toBe(true)
  })

  it('クールダウン中は拒否し、経過後は許可する', () => {
    const lastRunAt = new Date(now.getTime() - 10 * 1000)

    const blocked = checkUsageLimits({
      snapshot: { ...emptySnapshot, lastRunAt },
      limits: baseLimits,
      requestedCharacterCount: 10,
      projectedCostUsd: 0,
      now,
    })

    expect(blocked.allowed).toBe(false)
    if (!blocked.allowed) expect(blocked.reason).toContain('秒')

    const passed = checkUsageLimits({
      snapshot: { ...emptySnapshot, lastRunAt: new Date(now.getTime() - 31 * 1000) },
      limits: baseLimits,
      requestedCharacterCount: 10,
      projectedCostUsd: 0,
      now,
    })

    expect(passed.allowed).toBe(true)
  })
})
