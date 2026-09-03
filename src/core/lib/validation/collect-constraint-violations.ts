import { resolveValuesAtPath } from "@/core/lib/validation/resolve-values-at-path"

export type ConstraintRule = {
  path: string
  maxLength: number | null
  validate: ((value: string) => true | string) | null
}

export type ConstraintViolation = {
  field: string
  reason: string
}

/**
 * 1 件のドキュメントへルール一覧を当てて、制約に反する値だけを返す純関数。
 * 保存経路とは独立しているため、制約を後から足したときの既存データ監査に使える。
 */
export function collectConstraintViolations(props: {
  source: unknown
  rules: ReadonlyArray<ConstraintRule>
}): ConstraintViolation[] {
  const violations: ConstraintViolation[] = []

  for (const rule of props.rules) {
    for (const found of resolveValuesAtPath({ source: props.source, path: rule.path })) {
      if (rule.maxLength !== null && found.value.length > rule.maxLength) {
        violations.push({
          field: found.path,
          reason: `${rule.maxLength}文字以内にしてください（現在 ${found.value.length} 文字）`,
        })
        continue
      }

      if (rule.validate === null) continue

      const result = rule.validate(found.value)

      if (result !== true) violations.push({ field: found.path, reason: result })
    }
  }

  return violations
}
