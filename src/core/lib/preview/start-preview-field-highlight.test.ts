// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test"

import { startPreviewFieldHighlight } from "@/core/lib/preview/start-preview-field-highlight"

const editorOrigin = "http://localhost:3000"

const scrollIntoView = vi.fn()

const stops: Array<() => void> = []

beforeEach(() => {
  vi.useFakeTimers()
  vi.stubGlobal("innerHeight", 800)
  vi.stubGlobal("matchMedia", () => ({ matches: false }))
  Object.defineProperty(Element.prototype, "scrollIntoView", {
    value: scrollIntoView,
    configurable: true,
  })
})

afterEach(() => {
  for (const stop of stops.splice(0)) stop()
  document.body.innerHTML = ""
  scrollIntoView.mockClear()
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

/** 編集画面の window と、ハイライトを始めたプレビューの枠を用意する */
function openPreview() {
  const frame = document.createElement("iframe")
  const overlay = document.createElement("div")
  overlay.hidden = true
  document.body.appendChild(frame)
  document.body.appendChild(overlay)
  if (frame.contentWindow === null) throw new Error("editor window is not ready")

  const editor = frame.contentWindow
  const stop = startPreviewFieldHighlight({ overlay, editor, editorOrigin })
  stops.push(stop)

  const send = (data: unknown, source: Window = editor, origin = editorOrigin) => {
    window.dispatchEvent(new MessageEvent("message", { data, source, origin }))
  }

  return { overlay, editor, stop, send }
}

/** jsdom はレイアウトを持たないため、要素の位置を指定して置く */
function place(path: string, top: number) {
  const element = document.createElement("div")
  element.dataset.cmsField = path
  Object.defineProperty(element, "getClientRects", { value: () => ({ length: 1 }) })
  Object.defineProperty(element, "getBoundingClientRect", {
    value: () => ({ left: 20, top, width: 300, height: 40, right: 320, bottom: top + 40 }),
  })
  document.body.appendChild(element)
  return element
}

describe("startPreviewFieldHighlight", () => {
  it("frames the element for the focused field without scrolling a visible element", () => {
    const preview = openPreview()
    place("profile.rows.0.label", 100)
    preview.send({ type: "cms-field-focus", path: "profile.rows.0.label" })

    expect(preview.overlay.hidden).toBe(false)
    expect(preview.overlay.style.transform).toBe("translate(18px, 98px)")
    expect(preview.overlay.style.width).toBe("304px")
    expect(preview.overlay.style.height).toBe("44px")
    expect(scrollIntoView).not.toHaveBeenCalled()
  })

  it("scrolls an element outside the viewport to the center", () => {
    const preview = openPreview()
    const target = place("title", 1600)
    preview.send({ type: "cms-field-focus", path: "title" })

    expect(scrollIntoView).toHaveBeenCalledExactlyOnceWith({ block: "center", behavior: "smooth" })
    expect(scrollIntoView.mock.contexts[0]).toBe(target)
  })

  it("hides the frame when the editor clears the focus or the field has no element", () => {
    const preview = openPreview()
    place("title", 100)
    preview.send({ type: "cms-field-focus", path: "title" })
    preview.send({ type: "cms-field-focus", path: null })
    expect(preview.overlay.hidden).toBe(true)

    preview.send({ type: "cms-field-focus", path: "access.offices.0.name" })
    expect(preview.overlay.hidden).toBe(true)
  })

  it("finds the element again after a saved draft re-renders the page", () => {
    const preview = openPreview()
    const original = place("title", 100)
    preview.send({ type: "cms-field-focus", path: "title" })

    original.remove()
    place("title", 300)
    vi.advanceTimersToNextFrame()

    expect(preview.overlay.hidden).toBe(false)
    expect(preview.overlay.style.transform).toBe("translate(18px, 298px)")
  })

  it("ignores other windows, foreign origins, and unrelated messages", () => {
    const preview = openPreview()
    place("title", 100)
    preview.send({ type: "cms-field-focus", path: "title" }, window)
    preview.send({ type: "cms-field-focus", path: "title" }, preview.editor, "https://example.com")
    preview.send({ type: "payload-live-preview", path: "title" })

    expect(preview.overlay.hidden).toBe(true)
  })

  it("stops listening and hides the frame when stopped", () => {
    const preview = openPreview()
    place("title", 100)
    preview.send({ type: "cms-field-focus", path: "title" })
    preview.stop()
    expect(preview.overlay.hidden).toBe(true)

    preview.send({ type: "cms-field-focus", path: "title" })
    expect(preview.overlay.hidden).toBe(true)
  })
})
