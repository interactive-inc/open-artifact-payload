import type { UsageLimits } from '@/core/lib/ai-translation/translation-types'

/**
 * 実装側（サービス提供側）が環境変数で設定する利用上限の天井を読み取る。
 * 管理画面の設定値がどうであれ、この値を超える上限は有効にならない。
 * クライアント管理者が上限を引き上げても API 原価が想定を超えないようにするガード。
 * 不正な値（非数値・負数・空文字）は未設定として扱う。
 */
export function resolveUsageLimitCeilings(
  env: Record<string, string | undefined>,
): Partial<UsageLimits> {
  const toCeiling = (value: string | undefined): number | null => {
    if (value === undefined || value.trim() === '') return null
    const parsed = Number(value)
    if (!Number.isFinite(parsed) || parsed < 0) return null
    return parsed
  }

  const monthlyRunLimit = toCeiling(env.AI_TRANSLATION_MAX_MONTHLY_RUNS)
  const monthlyCharacterLimit = toCeiling(env.AI_TRANSLATION_MAX_MONTHLY_CHARACTERS)
  const monthlyCostLimitUsd = toCeiling(env.AI_TRANSLATION_MAX_MONTHLY_COST_USD)
  const perRunCharacterLimit = toCeiling(env.AI_TRANSLATION_MAX_PER_RUN_CHARACTERS)

  return {
    ...(monthlyRunLimit !== null ? { monthlyRunLimit } : {}),
    ...(monthlyCharacterLimit !== null ? { monthlyCharacterLimit } : {}),
    ...(monthlyCostLimitUsd !== null ? { monthlyCostLimitUsd } : {}),
    ...(perRunCharacterLimit !== null ? { perRunCharacterLimit } : {}),
  }
}
