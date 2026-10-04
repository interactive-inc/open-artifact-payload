/**
 * 枠で囲む範囲を返す。表のセルのように見た目の箱を持たない要素は、中身（文字や子要素）が
 * 描かれている範囲にする。列の幅いっぱいに広がるセルでも文字の周りだけになり、余白を足した枠が
 * 隣の列に重ならない。ボタンやカードのように背景・線・影で箱が見える要素と、中身が描かれていない
 * 要素（画像だけの要素など）は要素の箱を返す
 */
export function getContentRect(element: Element): DOMRect {
  if (hasVisibleBox(element)) return element.getBoundingClientRect()

  const range = element.ownerDocument.createRange()
  range.selectNodeContents(element)

  const contentRect = range.getBoundingClientRect()
  if (contentRect.width === 0 || contentRect.height === 0) return element.getBoundingClientRect()

  return contentRect
}

function hasVisibleBox(element: Element): boolean {
  const style = element.ownerDocument.defaultView?.getComputedStyle(element) ?? null
  if (style === null) return false

  const hasBackground = !isTransparent(style.backgroundColor) || !isNone(style.backgroundImage)
  const hasBorder = ["top", "right", "bottom", "left"].some(
    (side) =>
      Number.parseFloat(style.getPropertyValue(`border-${side}-width`)) > 0 &&
      style.getPropertyValue(`border-${side}-style`) !== "none",
  )
  const hasShadow = !isNone(style.boxShadow)

  return hasBackground || hasBorder || hasShadow
}

/** 計算済みの色が透明か。rgba(…, 0) と、oklch など「/ 0)」で終わる形の両方を扱う */
function isTransparent(color: string): boolean {
  return (
    color === "" ||
    color === "transparent" ||
    /^rgba\(.*,\s*0\)$/.test(color) ||
    /\/\s*0\)$/.test(color)
  )
}

/** 計算値が「無し」か。jsdom は既定値を空文字で返すため none と同じに扱う */
function isNone(value: string): boolean {
  return value === "" || value === "none"
}
