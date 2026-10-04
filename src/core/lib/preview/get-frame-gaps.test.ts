// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test"

import { getFrameGaps } from "@/core/lib/preview/get-frame-gaps"

/**
 * jsdom はレイアウトを持たないため、文字の行ごとの範囲を文字ノードごとに指定する。
 * 前後の空白を除いて測られたときは、空白 1 文字を 4px として範囲を狭める
 */
const lineRects = new Map<Node, ReadonlyArray<DOMRect>>()

const spaceWidth = 4

beforeEach(() => {
  // jsdom の Range は位置を測るメソッドを持たないため足す
  Object.defineProperty(Range.prototype, "getClientRects", {
    value: function (this: Range) {
      const node = this.startContainer
      const lines = lineRects.get(node) ?? []
      const trimmedEnd = (node.textContent ?? "").length - this.endOffset
      return lines.map(
        (line) =>
          new DOMRect(
            line.left + this.startOffset * spaceWidth,
            line.top,
            line.width - (this.startOffset + trimmedEnd) * spaceWidth,
            line.height,
          ),
      )
    },
    configurable: true,
  })
})

afterEach(() => {
  lineRects.clear()
  Reflect.deleteProperty(Range.prototype, "getClientRects")
  document.body.innerHTML = ""
  vi.restoreAllMocks()
})

/** 指定した位置に描かれる文字を置く。行の上下 3px は字形の掛からない部分として扱われる */
function placeText(text: string, line: DOMRect, parent: Element = document.body) {
  const node = document.createTextNode(text)
  parent.appendChild(node)
  lineRects.set(node, [line])
  return node
}

/** 電話番号の要素。中身は (100, 50) から幅 120・高さ 24 */
function createTarget() {
  const target = document.createElement("a")
  document.body.appendChild(target)
  placeText("098-988-1572", new DOMRect(100, 50, 120, 24), target)
  return { target, rect: new DOMRect(100, 50, 120, 24) }
}

describe("getFrameGaps", () => {
  it("keeps the full gap when nothing is drawn nearby", () => {
    const phone = createTarget()

    expect(getFrameGaps(phone.target, phone.rect)).toEqual({
      top: 10,
      right: 10,
      bottom: 10,
      left: 10,
    })
  })

  it("halves the space to text on the same line and to the line above, keeping the frame centered", () => {
    const phone = createTarget()
    placeText("Tel.", new DOMRect(60, 50, 36, 24))
    placeText("沖縄県宜野湾市大山3丁目11-32", new DOMRect(60, 26, 240, 24))

    expect(getFrameGaps(phone.target, phone.rect)).toEqual({
      top: 1.5,
      right: 2,
      bottom: 1.5,
      left: 2,
    })
  })

  it("narrows the side that loses less room for text placed diagonally", () => {
    const phone = createTarget()
    placeText("〒901-2223", new DOMRect(40, 25, 52, 24))

    expect(getFrameGaps(phone.target, phone.rect)).toEqual({
      top: 10,
      right: 4,
      bottom: 10,
      left: 4,
    })
  })

  it("keeps away from images next to the content", () => {
    const phone = createTarget()
    const image = document.createElement("img")
    vi.spyOn(image, "getBoundingClientRect").mockReturnValue(new DOMRect(230, 40, 100, 60))
    document.body.appendChild(image)

    expect(getFrameGaps(phone.target, phone.rect).right).toBe(5)
  })

  it("ignores its own text, text out of reach, and screen-reader-only text", () => {
    const phone = createTarget()
    placeText("内線", new DOMRect(100, 50, 24, 24), phone.target)
    placeText("Fax. 098-988-1573", new DOMRect(60, 120, 160, 24))
    placeText("（新しいタブで開く）", new DOMRect(225, 60, 1, 1))

    expect(getFrameGaps(phone.target, phone.rect)).toEqual({
      top: 10,
      right: 10,
      bottom: 10,
      left: 10,
    })
  })

  it("lets the frame line pass through the trailing space of a label", () => {
    const phone = createTarget()
    placeText("Fax. ", new DOMRect(60, 50, 40, 24))

    expect(getFrameGaps(phone.target, phone.rect).left).toBe(2)
  })

  it("ignores text cut off by an ancestor that hides its overflow", () => {
    const phone = createTarget()
    // 文字が入れ替わる動きのため、見えている文字の下に複製を置き、外側の要素で切り取っている
    const navigationItem = document.createElement("li")
    const slidingLabel = document.createElement("span")
    navigationItem.style.overflowX = "hidden"
    navigationItem.style.overflowY = "hidden"
    vi.spyOn(navigationItem, "getBoundingClientRect").mockReturnValue(new DOMRect(100, 0, 60, 26))
    vi.spyOn(slidingLabel, "getBoundingClientRect").mockReturnValue(new DOMRect(100, 0, 60, 50))
    navigationItem.appendChild(slidingLabel)
    document.body.appendChild(navigationItem)
    placeText("ABOUT US", new DOMRect(100, 26, 60, 24), slidingLabel)

    expect(getFrameGaps(phone.target, phone.rect).top).toBe(10)
  })

  it("leaves a minimal gap when text touches the content", () => {
    const phone = createTarget()
    placeText("Tel.", new DOMRect(64, 50, 36, 24))

    expect(getFrameGaps(phone.target, phone.rect).left).toBe(1)
  })
})
