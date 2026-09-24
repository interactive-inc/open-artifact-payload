// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vite-plus/test"

import { FieldFocusBridge } from "@/core/admin/preview/field-focus-bridge"

afterEach(() => {
  cleanup()
  document.body.innerHTML = ""
})

/** Payload がライブプレビューを横に開いたときの iframe を置く */
function openLivePreview() {
  const frame = document.createElement("iframe")
  frame.id = "live-preview-iframe"
  frame.src = "http://localhost:3000/next/preview/?path=%2Fcompany%2F"
  document.body.appendChild(frame)
  if (frame.contentWindow === null) throw new Error("preview window is not ready")
  return vi.spyOn(frame.contentWindow, "postMessage").mockImplementation(() => undefined)
}

function renderEditForm() {
  render(
    <FieldFocusBridge>
      <form>
        <input aria-label="項目名" name="profile.rows.0.label" />
        <button type="submit">保存</button>
      </form>
    </FieldFocusBridge>,
  )
}

describe("FieldFocusBridge", () => {
  it("tells the live preview which field gained focus, and clears it on other controls", () => {
    const postMessage = openLivePreview()
    renderEditForm()

    screen.getByLabelText("項目名").focus()
    screen.getByRole("button", { name: "保存" }).focus()

    expect(postMessage.mock.calls).toEqual([
      [{ type: "cms-field-focus", path: "profile.rows.0.label" }, "http://localhost:3000"],
      [{ type: "cms-field-focus", path: null }, "http://localhost:3000"],
    ])
  })

  it("does nothing while the live preview is closed", () => {
    renderEditForm()
    expect(() => screen.getByLabelText("項目名").focus()).not.toThrow()
  })

  it("stops listening after the admin unmounts", () => {
    const postMessage = openLivePreview()
    renderEditForm()
    const input = screen.getByLabelText("項目名")
    cleanup()

    document.body.appendChild(input)
    input.focus()
    expect(postMessage).not.toHaveBeenCalled()
  })
})
