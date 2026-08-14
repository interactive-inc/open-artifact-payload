/**
 * @vitest-environment jsdom
 */
import { render } from "@testing-library/react"
import React from "react"
import { describe, expect, it } from "vite-plus/test"

import { RichTextSection } from "@/core/sections/rich-text-section"
import { exampleRichText } from "@/core/test-support/example-rich-text"

describe("RichTextSection", () => {
  it("enabled=false のとき何も描画しない", () => {
    const { container } = render(
      <RichTextSection data={{ enabled: false, heading: "見出し", body: exampleRichText }} />,
    )
    expect(container.firstChild).toBeNull()
  })

  it("enabled=true のとき見出しを描画し、本文の描画でエラーにならない", () => {
    const { getByText } = render(
      <RichTextSection data={{ enabled: true, heading: "見出し", body: exampleRichText }} />,
    )
    expect(getByText("見出し")).toBeTruthy()
  })
})
