import type { UsageLimits, UsageSnapshot } from '@/core/lib/ai-translation/translation-types'

type Props = {
  snapshot: UsageSnapshot
  limits: UsageLimits
  requestedCharacterCount: number
  now: Date
}

type Verdict = { allowed: true } | { allowed: false; reason: string }

/**
 * AI API を呼ぶ前の利用上限チェック。1つでも超えていれば理由付きで拒否する。
 */
export function checkUsageLimits(props: Props): Verdict {
  if (props.requestedCharacterCount > props.limits.perRunCharacterLimit) {
    return {
      allowed: false,
      reason: `1回の翻訳文字数上限（${props.limits.perRunCharacterLimit}文字）を超えています`,
    }
  }

  if (props.snapshot.monthlyRunCount >= props.limits.monthlyRunLimit) {
    return {
      allowed: false,
      reason: `今月の翻訳実行回数上限（${props.limits.monthlyRunLimit}回）に達しています`,
    }
  }

  if (
    props.snapshot.monthlyCharacterCount + props.requestedCharacterCount >
    props.limits.monthlyCharacterLimit
  ) {
    return {
      allowed: false,
      reason: `今月の翻訳文字数上限（${props.limits.monthlyCharacterLimit}文字）を超えます`,
    }
  }

  if (props.snapshot.monthlyCostUsd >= props.limits.monthlyCostLimitUsd) {
    return {
      allowed: false,
      reason: `今月の推定API費用上限（$${props.limits.monthlyCostLimitUsd}）に達しています`,
    }
  }

  if (props.snapshot.lastRunAt) {
    const elapsedSeconds = (props.now.getTime() - props.snapshot.lastRunAt.getTime()) / 1000

    if (elapsedSeconds < props.limits.cooldownSeconds) {
      const waitSeconds = Math.ceil(props.limits.cooldownSeconds - elapsedSeconds)

      return {
        allowed: false,
        reason: `連続実行はできません。${waitSeconds}秒後に再実行してください`,
      }
    }
  }

  return { allowed: true }
}
