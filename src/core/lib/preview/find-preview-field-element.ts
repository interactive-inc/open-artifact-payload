const fieldAttribute = "data-cms-field"

/**
 * フィールドのパスに最も長く一致する data-cms-field 要素を探す。
 * profile.rows.0.label に印が無ければ profile.rows.0、profile.rows、profile の順にさかのぼる。
 * 画面幅で非表示になっている要素は選ばない
 */
export function findPreviewFieldElement(root: ParentNode, path: string): Element | null {
  const elements = [...root.querySelectorAll(`[${fieldAttribute}]`)].filter(
    (element) => element.getClientRects().length > 0,
  )

  const segments = path.split(".")

  const candidates = segments.map((_, index) =>
    segments.slice(0, segments.length - index).join("."),
  )

  for (const candidate of candidates) {
    const element = elements.find((element) => element.getAttribute(fieldAttribute) === candidate)
    if (element) return element
  }

  return null
}
