import { describe, expect, it } from 'vite-plus/test'

import { resolveEffectiveUsageLimits } from '@/core/lib/ai-translation/resolve-effective-usage-limits'

describe('resolveEffectiveUsageLimits', () => {
  it('DB の設定値と env 天井の小さい方を採用する', () => {
    const limits = resolveEffectiveUsageLimits({
      limitsGroup: {
        monthlyRunLimit: 1000,
        monthlyCharacterLimit: 50000,
        monthlyCostLimitUsd: 100,
        perRunCharacterLimit: 20000,
        cooldownSeconds: 30,
      },
      env: {
        AI_TRANSLATION_MAX_MONTHLY_RUNS: '100',
        AI_TRANSLATION_MAX_MONTHLY_COST_USD: '10',
      },
    })

    // env の方が小さい → env 勝ち
    expect(limits.monthlyRunLimit).toBe(100)
    expect(limits.monthlyCostLimitUsd).toBe(10)
    // env 未設定 or DB の方が小さい → DB 勝ち
    expect(limits.monthlyCharacterLimit).toBe(50000)
    expect(limits.perRunCharacterLimit).toBe(20000)
    expect(limits.cooldownSeconds).toBe(30)
  })

  it('DB 未保存でもデフォルト値で補完する', () => {
    const limits = resolveEffectiveUsageLimits({ limitsGroup: null, env: {} })

    expect(limits).toEqual({
      monthlyRunLimit: 100,
      monthlyCharacterLimit: 300000,
      monthlyCostLimitUsd: 10,
      perRunCharacterLimit: 20000,
      cooldownSeconds: 30,
    })
  })

  it('デフォルト値にも env 天井が効く', () => {
    const limits = resolveEffectiveUsageLimits({
      limitsGroup: null,
      env: { AI_TRANSLATION_MAX_MONTHLY_RUNS: '10' },
    })

    expect(limits.monthlyRunLimit).toBe(10)
  })
})
