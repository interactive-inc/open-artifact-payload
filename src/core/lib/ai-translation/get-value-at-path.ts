/**
 * ['headerNav', 0, 'label'] のようなパスでネスト値を取得する。途中が欠けていれば undefined。
 */
export function getValueAtPath(target: unknown, path: ReadonlyArray<string | number>): unknown {
  return path.reduce<unknown>(
    (current, key) =>
      current && typeof current === 'object' ? Reflect.get(current, key) : undefined,
    target,
  )
}
