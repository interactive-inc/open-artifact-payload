// @vitest-environment jsdom

import { afterEach, describe, expect, it } from "vite-plus/test"

import { findPreviewFieldElement } from "@/core/lib/preview/find-preview-field-element"

afterEach(() => {
  document.body.innerHTML = ""
})

/** jsdom はレイアウトを持たないため、描画済みの要素だけ矩形を返すようにする */
function render(html: string) {
  document.body.innerHTML = html
  for (const element of document.querySelectorAll("[data-cms-field]:not([data-hidden])")) {
    Object.defineProperty(element, "getClientRects", { value: () => ({ length: 1 }) })
  }
}

describe("findPreviewFieldElement", () => {
  it("returns the element marked with the exact path", () => {
    render(`
      <section data-cms-field="profile">
        <div data-cms-field="profile.rows.0"><dt id="label" data-cms-field="profile.rows.0.label"></dt></div>
      </section>
    `)
    expect(findPreviewFieldElement(document, "profile.rows.0.label")?.id).toBe("label")
  })

  it("falls back to the closest marked row or section", () => {
    render(`
      <section id="section" data-cms-field="profile">
        <div id="row" data-cms-field="profile.rows.0"></div>
      </section>
    `)
    expect(findPreviewFieldElement(document, "profile.rows.0.content")?.id).toBe("row")
    expect(findPreviewFieldElement(document, "profile.enabled")?.id).toBe("section")
  })

  it("does not match a sibling whose path only shares a text prefix", () => {
    render(`<div data-cms-field="profile.rows.1"></div>`)
    expect(findPreviewFieldElement(document, "profile.rows.10")).toBeNull()
  })

  it("skips elements hidden at the current screen width", () => {
    render(`
      <figure id="gallery" data-cms-field="gallery"></figure>
      <figure data-cms-field="gallery.mobileImage" data-hidden></figure>
    `)
    expect(findPreviewFieldElement(document, "gallery.mobileImage")?.id).toBe("gallery")
  })

  it("returns null when nothing on the page corresponds to the field", () => {
    render(`<h1 data-cms-field="title"></h1>`)
    expect(findPreviewFieldElement(document, "access.offices.0.name")).toBeNull()
  })
})
