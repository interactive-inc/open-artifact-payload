// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test"

import { startPreviewFieldHighlight } from "@/core/lib/preview/start-preview-field-highlight"

const editorOrigin = "http://localhost:3000"

const scrollTo = vi.fn()

const topmostElement = { current: null as Element | null }

const stops: Array<() => void> = []

beforeEach(() => {
  vi.useFakeTimers()
  vi.stubGlobal("innerWidth", 1200)
  vi.stubGlobal("innerHeight", 800)
  vi.stubGlobal("matchMedia", () => ({ matches: false }))
  vi.stubGlobal("scrollTo", scrollTo)
  // jsdom は elementFromPoint を持たないため、画面上端の要素を指定して返す
  Object.defineProperty(document, "elementFromPoint", {
    value: () => topmostElement.current,
    configurable: true,
  })
})

afterEach(() => {
  for (const stop of stops.splice(0)) stop()
  document.body.innerHTML = ""
  scrollTo.mockClear()
  topmostElement.current = null
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
function place(path: string, top: number, horizontal = { left: 20, width: 300 }) {
  const element = document.createElement("div")
  const left = horizontal.left
  const width = horizontal.width
  element.dataset.cmsField = path
  Object.defineProperty(element, "getClientRects", { value: () => ({ length: 1 }) })
  Object.defineProperty(element, "getBoundingClientRect", {
    value: () => ({ left, top, width, height: 40, right: left + width, bottom: top + 40 }),
  })
  document.body.appendChild(element)
  return element
}

describe("startPreviewFieldHighlight", () => {
  it("frames the element with a gap for the focused field without scrolling a visible element", () => {
    const preview = openPreview()
    place("profile.rows.0.label", 100)
    preview.send({ type: "cms-field-focus", path: "profile.rows.0.label" })

    expect(preview.overlay.hidden).toBe(false)
    expect(preview.overlay.style.transform).toBe("translate(10px, 90px)")
    expect(preview.overlay.style.width).toBe("320px")
    expect(preview.overlay.style.height).toBe("60px")
    expect(scrollTo).not.toHaveBeenCalled()
  })

  it("keeps the frame inside the viewport for a full-width element", () => {
    const preview = openPreview()
    place("profile", 100, { left: 0, width: 1200 })
    preview.send({ type: "cms-field-focus", path: "profile" })

    expect(preview.overlay.style.transform).toBe("translate(2px, 90px)")
    expect(preview.overlay.style.width).toBe("1196px")
  })

  it("slides the frame only while it moves from one field to another", () => {
    const preview = openPreview()
    place("title", 100)
    place("summary", 300)
    preview.send({ type: "cms-field-focus", path: "title" })
    expect(preview.overlay.dataset.moving).toBeUndefined()

    preview.send({ type: "cms-field-focus", path: "summary" })
    expect(preview.overlay.dataset.moving).toBe("")

    vi.advanceTimersByTime(200)
    expect(preview.overlay.dataset.moving).toBeUndefined()
  })

  it("scrolls an element outside the viewport to the center", () => {
    const preview = openPreview()
    place("title", 1600)
    preview.send({ type: "cms-field-focus", path: "title" })

    expect(scrollTo).toHaveBeenCalledExactlyOnceWith({ top: 1220, behavior: "smooth" })
  })

  it("scrolls an element hidden behind a fixed header into the area below it", () => {
    const preview = openPreview()
    const header = document.createElement("header")
    header.style.position = "fixed"
    Object.defineProperty(header, "getBoundingClientRect", { value: () => ({ bottom: 90 }) })
    document.body.appendChild(header)
    topmostElement.current = header
    vi.stubGlobal("scrollY", 500)
    place("title", 40)
    preview.send({ type: "cms-field-focus", path: "title" })

    expect(scrollTo).toHaveBeenCalledExactlyOnceWith({ top: 115, behavior: "smooth" })
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
    expect(preview.overlay.style.transform).toBe("translate(10px, 290px)")
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
