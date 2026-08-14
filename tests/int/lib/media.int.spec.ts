import type { Media } from "@/payload-types"
import { resolveMediaAlt } from "@/core/lib/media/resolve-media-alt"
import { resolveMediaUrl } from "@/core/lib/media/resolve-media-url"
import { exampleMedia } from "@/core/test-support/example-media"
import { describe, expect, it } from "vite-plus/test"

const mediaWithNullUrl: Media = { ...exampleMedia, url: null }

describe("resolveMediaUrl", () => {
  it("null の場合は undefined を返す", () => {
    expect(resolveMediaUrl(null)).toBeUndefined()
  })

  it("undefined の場合は undefined を返す", () => {
    expect(resolveMediaUrl(undefined)).toBeUndefined()
  })

  it("未 populate の数値 ID の場合は undefined を返す", () => {
    expect(resolveMediaUrl(1)).toBeUndefined()
  })

  it("未 populate の文字列 ID の場合は undefined を返す", () => {
    expect(resolveMediaUrl("media-1")).toBeUndefined()
  })

  it("populate 済み Media の url を返す", () => {
    expect(resolveMediaUrl(exampleMedia)).toBe(exampleMedia.url)
  })

  it("url が null の Media は undefined を返す", () => {
    expect(resolveMediaUrl(mediaWithNullUrl)).toBeUndefined()
  })
})

describe("resolveMediaAlt", () => {
  it("null の場合は undefined を返す", () => {
    expect(resolveMediaAlt(null)).toBeUndefined()
  })

  it("undefined の場合は undefined を返す", () => {
    expect(resolveMediaAlt(undefined)).toBeUndefined()
  })

  it("未 populate の数値 ID の場合は undefined を返す", () => {
    expect(resolveMediaAlt(2)).toBeUndefined()
  })

  it("未 populate の文字列 ID の場合は undefined を返す", () => {
    expect(resolveMediaAlt("media-2")).toBeUndefined()
  })

  it("populate 済み Media の alt を返す", () => {
    expect(resolveMediaAlt(exampleMedia)).toBe(exampleMedia.alt)
  })
})
