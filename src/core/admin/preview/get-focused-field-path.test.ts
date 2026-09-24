// @vitest-environment jsdom

import { afterEach, describe, expect, it } from "vite-plus/test"

import { getFocusedFieldPath } from "@/core/admin/preview/get-focused-field-path"

/** Payload 3 の編集フォームが描画する id・name・data-field-path の形を再現する */
const editForm = `
  <form>
    <div id="field-profile">
      <input id="field-profile__enabled" name="profile.enabled" type="checkbox" />
      <div id="field-profile__rows">
        <div id="profile-rows-row-0">
          <button id="row-toggle" type="button">toggle</button>
          <input id="label" name="profile.rows.0.label" />
          <div data-field-path="profile.rows.0.content">
            <div contenteditable="true"><p id="paragraph">text</p></div>
          </div>
        </div>
        <button id="add-row" type="button">add</button>
      </div>
      <div id="field-history__years">
        <div id="history-years-2-events-row-1"><button id="nested-row" type="button">toggle</button></div>
      </div>
    </div>
    <button id="save" type="submit">save</button>
  </form>
  <input id="outside" name="search" />
`

afterEach(() => {
  document.body.innerHTML = ""
})

function element(id: string) {
  document.body.innerHTML = editForm
  const found = document.getElementById(id)
  if (found === null) throw new Error(`missing #${id}`)
  return found
}

describe("getFocusedFieldPath", () => {
  it.each([
    ["label", "profile.rows.0.label"],
    ["field-profile__enabled", "profile.enabled"],
    ["paragraph", "profile.rows.0.content"],
    ["row-toggle", "profile.rows.0"],
    ["nested-row", "history.years.2.events.1"],
    ["add-row", "profile.rows"],
  ])("reads #%s as %s", (id, path) => {
    expect(getFocusedFieldPath(element(id))).toBe(path)
  })

  it("returns null for form controls that are not fields and for elements outside the form", () => {
    expect(getFocusedFieldPath(element("save"))).toBeNull()
    expect(getFocusedFieldPath(element("outside"))).toBeNull()
  })
})
