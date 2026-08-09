import { getValueAtPath } from "@/core/lib/ai-translation/get-value-at-path"

/**
 * パスの親コンテナが存在するときだけ値を書き込む。親が無ければ false（構造は作らない）。
 */
export function setValueAtPath(
  target: unknown,
  path: ReadonlyArray<string | number>,
  value: unknown,
): boolean {
  const lastKey = path[path.length - 1]

  if (lastKey === undefined) return false

  const parent = getValueAtPath(target, path.slice(0, -1))

  if (!parent || typeof parent !== "object") return false

  Reflect.set(parent, lastKey, value)

  return true
}
