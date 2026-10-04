export type FrameGaps = {
  top: number
  right: number
  bottom: number
  left: number
}

type Side = keyof FrameGaps

/** 枠と中身の間に取りたい余白 */
const preferredGap = 10

/** 隣と詰まっていても残す余白 */
const minimumGap = 1

/** 文字の描画範囲の上下にある、字形の掛からない部分。枠の線がここに入るのは許す */
const textLeading = 3

/** 読み上げ専用の文字（1px に縮めた要素）など、見えない大きさの描画は避けなくてよい */
const minimumObstacleSize = 2

/**
 * 枠と中身の間の余白を決める。基本は preferredGap だが、近くに他の文字や画像があれば、
 * その辺の余白を間の半分までにして、枠の線が隣の文字に掛からず中間に引かれるようにする。
 * 片側だけ詰まった枠はずれて見えるため、左右・上下はそれぞれ狭い方に揃えて中身を中央に置く
 */
export function getFrameGaps(target: Element, rect: DOMRect): FrameGaps {
  const initial: FrameGaps = {
    top: preferredGap,
    right: preferredGap,
    bottom: preferredGap,
    left: preferredGap,
  }
  const gaps = getNearbyObstacles(target, rect).reduce(
    (narrowed, obstacle) => narrowGaps(narrowed, rect, obstacle),
    initial,
  )
  const horizontal = Math.min(gaps.left, gaps.right)
  const vertical = Math.min(gaps.top, gaps.bottom)

  return { top: vertical, right: horizontal, bottom: vertical, left: horizontal }
}

type Drawing = {
  element: Element
  rect: DOMRect
}

/**
 * 中身から preferredGap の 2 倍以内に見えている、対象の外の文字と画像の範囲。
 * 間の半分が preferredGap を下回るものだけが余白を縮める
 */
function getNearbyObstacles(target: Element, rect: DOMRect): ReadonlyArray<DOMRect> {
  const reachGap = preferredGap * 2
  const reach = new DOMRect(
    rect.left - reachGap,
    rect.top - reachGap,
    rect.width + reachGap * 2,
    rect.height + reachGap * 2,
  )
  const body = target.ownerDocument.body
  const texts = [...iterateTextNodes(body)]
    .filter((node) => !target.contains(node))
    .flatMap((node) => getTextDrawings(node, reach))
  const media = [...body.querySelectorAll("img, svg, video, canvas, iframe")]
    .filter((element) => !target.contains(element))
    .map((element) => ({ element, rect: element.getBoundingClientRect() }))

  return [...texts, ...media]
    .filter((drawing) => intersects(drawing.rect, reach))
    .flatMap((drawing) => {
      const visible = getVisibleRect(drawing)
      return visible === null ? [] : [visible]
    })
    .filter(
      (obstacle) => obstacle.width >= minimumObstacleSize && obstacle.height >= minimumObstacleSize,
    )
}

/**
 * 文字の行ごとの範囲。ページ中の全ての文字を測ると重いため、親要素が近くに無い文字は測らない。
 * display: contents のように親要素が大きさを持たないときは判断できないので測る
 */
function getTextDrawings(node: Text, reach: DOMRect): ReadonlyArray<Drawing> {
  const parent = node.parentElement
  if (parent === null) return []

  const parentRect = parent.getBoundingClientRect()
  const hasSize = parentRect.width > 0 || parentRect.height > 0
  if (hasSize && !intersects(parentRect, reach)) return []

  return getTextRects(node).map((line) => ({ element: parent, rect: line }))
}

/**
 * 実際に見えている範囲。非表示・透明の要素と、overflow で切り取られて見えない部分を除く。
 * 文字が入れ替わる動きのために隠した複製や、読み上げ専用の文字は避けなくてよい
 */
function getVisibleRect(drawing: Drawing): DOMRect | null {
  if (!isRendered(drawing.element)) return null

  return getClippingAncestors(drawing.element).reduce<DOMRect | null>(
    (visible, ancestor) =>
      visible === null ? null : intersection(visible, ancestor.getBoundingClientRect()),
    drawing.rect,
  )
}

function isRendered(element: Element): boolean {
  // jsdom など checkVisibility を持たない環境では、見えているものとして扱う
  if (typeof element.checkVisibility !== "function") return true

  return element.checkVisibility({ visibilityProperty: true, opacityProperty: true })
}

/** 自身と祖先のうち、はみ出した部分を切り取る要素。ページ全体のスクロールを担う body は除く */
function getClippingAncestors(element: Element): ReadonlyArray<Element> {
  const view = element.ownerDocument.defaultView
  if (view === null) return []

  return getSelfAndAncestors(element).filter((ancestor) => {
    const style = view.getComputedStyle(ancestor)
    return isClipping(style.overflowX) || isClipping(style.overflowY)
  })
}

function getSelfAndAncestors(element: Element | null): ReadonlyArray<Element> {
  if (element === null || element === element.ownerDocument.body) return []

  return [element, ...getSelfAndAncestors(element.parentElement)]
}

function isClipping(overflow: string): boolean {
  return overflow !== "" && overflow !== "visible"
}

function* iterateTextNodes(root: Node): Generator<Text> {
  const walker = root.ownerDocument?.createTreeWalker(root, NodeFilter.SHOW_TEXT) ?? null
  if (walker === null) return

  while (true) {
    const node = walker.nextNode()
    if (node === null) return
    if (node instanceof Text && node.data.trim() !== "") yield node
  }
}

/**
 * 文字の行ごとの範囲から、前後の空白と、上下の字形の掛からない部分を除いたもの。
 * 「Fax. 」の後ろの空白のように字形の無い部分へは枠の線を引いてよい
 */
function getTextRects(node: Text): ReadonlyArray<DOMRect> {
  const range = node.ownerDocument.createRange()
  range.setStart(node, node.data.length - node.data.trimStart().length)
  range.setEnd(node, node.data.trimEnd().length)

  return [...range.getClientRects()].map((line) => {
    const inset = Math.min(textLeading, line.height / 4)
    return new DOMRect(line.left, line.top + inset, line.width, line.height - inset * 2)
  })
}

/**
 * 障害物のある側の余白を、中身との間の半分まで縮める。斜めにある障害物は、縮める量が少ない側を縮める。
 * 中身と重なっている障害物（重ねて配置された文字など）は避けようがないので扱わない
 */
function narrowGaps(gaps: FrameGaps, rect: DOMRect, obstacle: DOMRect): FrameGaps {
  const distances = getDistances(rect, obstacle)
  const horizontal = distances.left ?? distances.right ?? null
  const vertical = distances.top ?? distances.bottom ?? null
  const horizontalSide: Side = distances.left === null ? "right" : "left"
  const verticalSide: Side = distances.top === null ? "bottom" : "top"

  if (horizontal === null && vertical === null) return gaps

  if (vertical === null) return withGap(gaps, horizontalSide, horizontal)

  if (horizontal === null) return withGap(gaps, verticalSide, vertical)

  // 斜め。どちらかの辺が届かなければ、枠はもう障害物を避けている
  if (gaps[horizontalSide] <= horizontal || gaps[verticalSide] <= vertical) return gaps

  const horizontalLoss = gaps[horizontalSide] - horizontal / 2
  const verticalLoss = gaps[verticalSide] - vertical / 2

  return horizontalLoss <= verticalLoss
    ? withGap(gaps, horizontalSide, horizontal)
    : withGap(gaps, verticalSide, vertical)
}

/** 中身から見て障害物がある向きと、その間の距離。その向きに無ければ null */
function getDistances(rect: DOMRect, obstacle: DOMRect) {
  return {
    left: obstacle.right <= rect.left ? rect.left - obstacle.right : null,
    right: obstacle.left >= rect.right ? obstacle.left - rect.right : null,
    top: obstacle.bottom <= rect.top ? rect.top - obstacle.bottom : null,
    bottom: obstacle.top >= rect.bottom ? obstacle.top - rect.bottom : null,
  }
}

function withGap(gaps: FrameGaps, side: Side, distance: number | null): FrameGaps {
  if (distance === null) return gaps

  const gap = Math.max(Math.min(gaps[side], distance / 2), minimumGap)
  return { ...gaps, [side]: gap }
}

function intersects(a: DOMRect, b: DOMRect): boolean {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top
}

/** 重なっている部分。重ならなければ null */
function intersection(a: DOMRect, b: DOMRect): DOMRect | null {
  if (!intersects(a, b)) return null

  const left = Math.max(a.left, b.left)
  const top = Math.max(a.top, b.top)
  return new DOMRect(
    left,
    top,
    Math.min(a.right, b.right) - left,
    Math.min(a.bottom, b.bottom) - top,
  )
}
