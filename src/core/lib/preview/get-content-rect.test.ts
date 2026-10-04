// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test"

import { getContentRect } from "@/core/lib/preview/get-content-rect"

/** jsdom はレイアウトを持たないため、中身の範囲を要素ごとに指定する */
const contentRects = new Map<Node, DOMRect>()

beforeEach(() => {
  // jsdom の Range は位置を測るメソッドを持たないため足す
  Object.defineProperty(Range.prototype, "getBoundingClientRect", {
    value: function (this: Range) {
      return contentRects.get(this.startContainer) ?? new DOMRect(0, 0, 0, 0)
    },
    configurable: true,
  })
})

afterEach(() => {
  contentRects.clear()
  Reflect.deleteProperty(Range.prototype, "getBoundingClientRect")
  vi.restoreAllMocks()
})

function createCell() {
  const cell = document.createElement("dt")
  cell.textContent = "会社名"
  vi.spyOn(cell, "getBoundingClientRect").mockReturnValue(new DOMRect(60, 636, 305, 48))
  return cell
}

describe("getContentRect", () => {
  it("returns the extent of the text inside a cell that spans the whole column", () => {
    const cell = createCell()
    contentRects.set(cell, new DOMRect(60, 636, 48, 24))

    expect(getContentRect(cell)).toEqual(new DOMRect(60, 636, 48, 24))
  })

  it("keeps the element box for a button, badge, or card that draws its own box", () => {
    const styles = [
      "background-color: rgb(0, 0, 0)",
      "background-color: oklch(0.97 0 0 / 0.5)",
      "border: 1px solid rgb(0, 0, 0)",
      "box-shadow: 0 0 0 1px rgb(0, 0, 0)",
    ]

    for (const style of styles) {
      const cell = createCell()
      cell.setAttribute("style", style)
      contentRects.set(cell, new DOMRect(60, 636, 48, 24))
      expect(getContentRect(cell), style).toEqual(new DOMRect(60, 636, 305, 48))
    }
  })

  it("treats transparent backgrounds and missing borders as no box", () => {
    const cell = createCell()
    cell.setAttribute("style", "background-color: rgba(0, 0, 0, 0); border: 0 solid black")
    contentRects.set(cell, new DOMRect(60, 636, 48, 24))

    expect(getContentRect(cell)).toEqual(new DOMRect(60, 636, 48, 24))
  })

  it("falls back to the element box when nothing inside is drawn", () => {
    const cell = createCell()

    expect(getContentRect(cell)).toEqual(new DOMRect(60, 636, 305, 48))
  })
})
