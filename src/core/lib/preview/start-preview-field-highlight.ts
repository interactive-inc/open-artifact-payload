import { parseFieldFocusMessage } from "@/core/lib/preview/field-focus-message"
import { findPreviewFieldElement } from "@/core/lib/preview/find-preview-field-element"

type Props = {
  overlay: HTMLElement
  editor: Window
  editorOrigin: string
}

type State = {
  path: string | null
  target: Element | null
  frame: number | null
  moveTimer: number | null
}

/** 枠と要素の間の余白。文字に線が触れないようにする */
const overlayGap = 10

/** 画面の左右端に接する要素でも線が見えるよう、枠を画面の内側に収める幅 */
const viewportInset = 2

/** 別の項目へ枠を滑らせる時間。CSS の data-moving 側の transition と揃える */
const moveDuration = 200

/**
 * 編集画面から届いた項目のパスに対応する要素へ枠を重ね、見えていなければ表示範囲へ移す。
 * 停止用の関数を返す
 */
export function startPreviewFieldHighlight(props: Props): () => void {
  const state: State = { path: null, target: null, frame: null, moveTimer: null }

  const onMessage = (event: MessageEvent) => {
    if (event.source !== props.editor || event.origin !== props.editorOrigin) return

    const message = parseFieldFocusMessage(event.data)
    if (message === null) return

    highlightField(props.overlay, state, message.path)
  }

  window.addEventListener("message", onMessage)

  return () => {
    window.removeEventListener("message", onMessage)
    highlightField(props.overlay, state, null)
    endMove(props.overlay, state)
  }
}

function highlightField(overlay: HTMLElement, state: State, path: string | null) {
  if (state.frame !== null) cancelAnimationFrame(state.frame)

  // 表示中の枠が別の項目へ移るときだけ滑らせる。現れる・消えるときと、スクロールへの追従は即時
  if (!overlay.hidden && path !== null && path !== state.path) startMove(overlay, state)

  state.path = path
  state.target = null
  followTarget(overlay, state)

  if (state.target !== null) revealElement(state.target)
}

/**
 * スクロールや保存後の再描画に合わせて毎フレーム枠を動かす。
 * 要素が差し替わったら同じパスで探し直し、見つからなければ枠を隠して止める
 */
function followTarget(overlay: HTMLElement, state: State) {
  state.frame = null
  if (state.path !== null && (state.target === null || !state.target.isConnected)) {
    state.target = findPreviewFieldElement(document, state.path)
  }

  placeOverlay(overlay, state.target)

  if (state.target !== null) {
    state.frame = requestAnimationFrame(() => followTarget(overlay, state))
  }
}

function startMove(overlay: HTMLElement, state: State) {
  if (state.moveTimer !== null) clearTimeout(state.moveTimer)
  overlay.dataset.moving = ""
  state.moveTimer = window.setTimeout(() => endMove(overlay, state), moveDuration)
}

function endMove(overlay: HTMLElement, state: State) {
  if (state.moveTimer !== null) clearTimeout(state.moveTimer)
  state.moveTimer = null
  delete overlay.dataset.moving
}

/**
 * 要素の位置に余白を足して枠を合わせる。要素が無い、または大きさを持たないときは隠す。
 * 毎フレーム呼ばれるため、値が変わったときだけ書き込んで再レイアウトを起こさない
 */
function placeOverlay(overlay: HTMLElement, target: Element | null) {
  const rect = target?.getBoundingClientRect() ?? null
  if (rect === null || (rect.width === 0 && rect.height === 0)) {
    overlay.hidden = true
    return
  }

  const left = Math.max(rect.left - overlayGap, viewportInset)
  const right = Math.min(rect.right + overlayGap, window.innerWidth - viewportInset)
  const transform = `translate(${left}px, ${rect.top - overlayGap}px)`
  const width = `${Math.max(right - left, 0)}px`
  const height = `${rect.height + overlayGap * 2}px`

  if (overlay.hidden) overlay.hidden = false
  if (overlay.style.transform !== transform) overlay.style.transform = transform
  if (overlay.style.width !== width) overlay.style.width = width
  if (overlay.style.height !== height) overlay.style.height = height
}

/**
 * 見えていない要素を、上端に固定されたヘッダーの下の見える範囲の中央へ寄せる。
 * 見える範囲より高い要素は、先頭をヘッダーのすぐ下に合わせる
 */
function revealElement(target: Element) {
  const rect = target.getBoundingClientRect()
  const headerBottom = getTopObstruction()
  const isVisible =
    rect.top - overlayGap >= headerBottom && rect.bottom + overlayGap <= window.innerHeight
  if (isVisible) return

  const visibleHeight = window.innerHeight - headerBottom
  const framedHeight = rect.height + overlayGap * 2
  const offset =
    framedHeight > visibleHeight
      ? headerBottom + overlayGap
      : headerBottom + (visibleHeight - rect.height) / 2
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

  window.scrollTo({
    top: window.scrollY + rect.top - offset,
    behavior: prefersReducedMotion ? "instant" : "smooth",
  })
}

/**
 * 画面の上端に固定・追従している要素（ヘッダーなど）の下端。無ければ 0。
 * 画面の半分より高い固定要素は背景などとみなして数えない
 */
function getTopObstruction(): number {
  const topmost = document.elementFromPoint(window.innerWidth / 2, 0)

  for (const element of getSelfAndAncestors(topmost)) {
    const position = window.getComputedStyle(element).position
    if (position !== "fixed" && position !== "sticky") continue

    const bottom = element.getBoundingClientRect().bottom
    return bottom < window.innerHeight / 2 ? Math.max(bottom, 0) : 0
  }

  return 0
}

function getSelfAndAncestors(element: Element | null): ReadonlyArray<Element> {
  if (element === null || element === document.body) return []

  return [element, ...getSelfAndAncestors(element.parentElement)]
}
