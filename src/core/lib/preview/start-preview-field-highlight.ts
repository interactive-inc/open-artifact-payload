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
}

const overlayGap = 2

/**
 * 編集画面から届いた項目のパスに対応する要素へ枠を重ね、見えていなければ表示範囲へ移す。
 * 停止用の関数を返す
 */
export function startPreviewFieldHighlight(props: Props): () => void {
  const state: State = { path: null, target: null, frame: null }

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
  }
}

function highlightField(overlay: HTMLElement, state: State, path: string | null) {
  if (state.frame !== null) cancelAnimationFrame(state.frame)

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

/**
 * 要素の位置に枠を合わせる。要素が無い、または大きさを持たないときは隠す。
 * 毎フレーム呼ばれるため、値が変わったときだけ書き込んで再レイアウトを起こさない
 */
function placeOverlay(overlay: HTMLElement, target: Element | null) {
  const rect = target?.getBoundingClientRect() ?? null
  if (rect === null || (rect.width === 0 && rect.height === 0)) {
    overlay.hidden = true
    return
  }

  const transform = `translate(${rect.left - overlayGap}px, ${rect.top - overlayGap}px)`
  const width = `${rect.width + overlayGap * 2}px`
  const height = `${rect.height + overlayGap * 2}px`

  if (overlay.hidden) overlay.hidden = false
  if (overlay.style.transform !== transform) overlay.style.transform = transform
  if (overlay.style.width !== width) overlay.style.width = width
  if (overlay.style.height !== height) overlay.style.height = height
}

/** 画面外の要素を中央へ寄せる。画面より高い要素は先頭を合わせる */
function revealElement(target: Element) {
  const rect = target.getBoundingClientRect()
  if (rect.top >= 0 && rect.bottom <= window.innerHeight) return

  const isTallerThanViewport = rect.height > window.innerHeight
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

  target.scrollIntoView({
    block: isTallerThanViewport ? "start" : "center",
    behavior: prefersReducedMotion ? "instant" : "smooth",
  })
}
