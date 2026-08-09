import { resolveUsageLimitCeilings } from "@/core/lib/ai-translation/resolve-usage-limit-ceilings"
import type { UsageLimits } from "@/core/lib/ai-translation/translation-types"

type LimitsGroup = {
  monthlyRunLimit?: number | null
  monthlyCharacterLimit?: number | null
  monthlyCostLimitUsd?: number | null
  perRunCharacterLimit?: number | null
  cooldownSeconds?: number | null
}

type Props = {
  limitsGroup: LimitsGroup | null | undefined
  env: Record<string, string | undefined>
}

/**
 * 実際に適用する利用上限を決める。管理画面の設定値（未保存はデフォルト補完）と
 * 環境変数の天井（実装側ガード）の小さい方を採用する。
 */
export function resolveEffectiveUsageLimits(props: Props): UsageLimits {
  const ceilings = resolveUsageLimitCeilings(props.env)

  return {
    monthlyRunLimit: Math.min(
      props.limitsGroup?.monthlyRunLimit ?? 100,
      ceilings.monthlyRunLimit ?? Infinity,
    ),
    monthlyCharacterLimit: Math.min(
      props.limitsGroup?.monthlyCharacterLimit ?? 300000,
      ceilings.monthlyCharacterLimit ?? Infinity,
    ),
    monthlyCostLimitUsd: Math.min(
      props.limitsGroup?.monthlyCostLimitUsd ?? 10,
      ceilings.monthlyCostLimitUsd ?? Infinity,
    ),
    perRunCharacterLimit: Math.min(
      props.limitsGroup?.perRunCharacterLimit ?? 20000,
      ceilings.perRunCharacterLimit ?? Infinity,
    ),
    cooldownSeconds: props.limitsGroup?.cooldownSeconds ?? 30,
  }
}
