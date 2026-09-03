type FoundValue = {
  path: string
  value: string
}

/**
 * "hero.ctaHref" や "headerNav[].href" のようなパス表記でドキュメントを辿り、
 * 実際に入っている文字列だけを、配列添字まで含む具体的なパスと一緒に返す。
 * 値が無い・型が違う枝は黙って無視する（監査は入力済みの値だけを対象にする）。
 */
export function resolveValuesAtPath(props: { source: unknown; path: string }): FoundValue[] {
  if (props.path === "") {
    if (typeof props.source !== "string") return []

    return [{ path: "", value: props.source }]
  }

  if (typeof props.source !== "object" || props.source === null) return []

  const segments = props.path.split(".")
  const head = segments[0] ?? ""
  const rest = segments.slice(1).join(".")
  const isArraySegment = head.endsWith("[]")
  const key = isArraySegment ? head.slice(0, -2) : head
  const child = Reflect.get(props.source, key)

  if (!isArraySegment) {
    return resolveValuesAtPath({ source: child, path: rest }).map((found) => ({
      path: [key, found.path].filter((part) => part !== "").join("."),
      value: found.value,
    }))
  }

  if (!Array.isArray(child)) return []

  return child.flatMap((item, index) =>
    resolveValuesAtPath({ source: item, path: rest }).map((found) => ({
      path: [`${key}[${index}]`, found.path].filter((part) => part !== "").join("."),
      value: found.value,
    })),
  )
}
