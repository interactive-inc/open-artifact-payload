import { describe, expect, it } from "vite-plus/test"

import { parseFieldFocusMessage } from "@/core/lib/preview/field-focus-message"

describe("parseFieldFocusMessage", () => {
  it("reads a field path and a highlight reset", () => {
    expect(
      parseFieldFocusMessage({ type: "cms-field-focus", path: "profile.rows.0.label" }),
    ).toEqual({ type: "cms-field-focus", path: "profile.rows.0.label" })
    expect(parseFieldFocusMessage({ type: "cms-field-focus", path: null })).toEqual({
      type: "cms-field-focus",
      path: null,
    })
  })

  it.each([
    null,
    "cms-field-focus",
    { type: "payload-live-preview", path: "title" },
    { type: "cms-field-focus" },
    { type: "cms-field-focus", path: 1 },
    { type: "cms-field-focus", path: "" },
    { type: "cms-field-focus", path: 'title"]' },
    { type: "cms-field-focus", path: "profile..rows" },
    { type: "cms-field-focus", path: ".title" },
    { type: "cms-field-focus", path: `a.${"b".repeat(300)}` },
  ])("ignores %j", (data) => {
    expect(parseFieldFocusMessage(data)).toBeNull()
  })
})
