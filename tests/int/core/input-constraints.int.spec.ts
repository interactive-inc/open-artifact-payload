import { getPayload, type Payload } from "payload"
import { afterAll, beforeAll, describe, expect, it } from "vite-plus/test"

import config from "@/payload.config"
import type { SiteSetting } from "@/payload-types"
import { SHORT_TEXT_MAX_LENGTH } from "@/core/lib/validation/text-limits"

// 1x1 の PNG。許可された MIME タイプの正常系に使う。
const PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="

let payload: Payload
let siteName: string
let originalHeaderNav: SiteSetting["headerNav"]
let originalSocial: SiteSetting["social"]

describe("CMS 入力のサーバー側制約", () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })

    const siteSettings = await payload.findGlobal({ slug: "site-settings", depth: 0 })

    // siteName は required のため、部分更新でも毎回渡さないと検証で落ちる。
    siteName = siteSettings.siteName || "制約テスト用サイト"
    originalHeaderNav = siteSettings.headerNav
    originalSocial = siteSettings.social
  })

  afterAll(async () => {
    await payload.updateGlobal({
      slug: "site-settings",
      data: { siteName, headerNav: originalHeaderNav, social: originalSocial },
    })
  })

  it("news は不正な形式のスラッグを拒否する", async () => {
    await expect(
      payload.create({
        collection: "news",
        data: {
          title: "不正スラッグ",
          slug: "Bad Slug!",
          publishedAt: new Date().toISOString(),
          category: "info",
        },
      }),
    ).rejects.toThrow()
  })

  it("news は上限を超えるタイトルを拒否する", async () => {
    await expect(
      payload.create({
        collection: "news",
        data: {
          title: "あ".repeat(SHORT_TEXT_MAX_LENGTH + 1),
          slug: "too-long-title",
          publishedAt: new Date().toISOString(),
          category: "info",
        },
      }),
    ).rejects.toThrow()
  })

  it("news は制約を満たす値なら保存できる", async () => {
    const created = await payload.create({
      collection: "news",
      data: {
        title: "制約テスト",
        slug: "constraint-test-news",
        publishedAt: new Date().toISOString(),
        category: "info",
      },
    })

    expect(created.slug).toBe("constraint-test-news")

    await payload.delete({ collection: "news", id: created.id })
  })

  it("site-settings は javascript: のナビリンクを拒否する", async () => {
    await expect(
      payload.updateGlobal({
        slug: "site-settings",
        data: { siteName, headerNav: [{ label: "危険", href: "javascript:alert(1)" }] },
      }),
    ).rejects.toThrow()
  })

  it("site-settings は内部パスと https のナビリンクを受け付ける", async () => {
    const updated = await payload.updateGlobal({
      slug: "site-settings",
      data: {
        siteName,
        headerNav: [
          { label: "会社概要", href: "/about" },
          { label: "外部サイト", href: "https://example.com" },
        ],
      },
    })

    expect(updated.headerNav?.[0]?.href).toBe("/about")
    expect(updated.headerNav?.[1]?.href).toBe("https://example.com")
  })

  it("site-settings は http の SNS URL を拒否する", async () => {
    await expect(
      payload.updateGlobal({
        slug: "site-settings",
        data: { siteName, social: { twitter: "http://example.com" } },
      }),
    ).rejects.toThrow()
  })

  it("media は許可されていない形式のファイルを拒否する", async () => {
    const textData = Buffer.from("plain text, not an image", "utf8")

    await expect(
      payload.create({
        collection: "media",
        data: { alt: "テキストファイル" },
        file: {
          data: textData,
          mimetype: "text/plain",
          name: "not-an-image.txt",
          size: textData.byteLength,
        },
      }),
    ).rejects.toThrow()
  })

  it("media は許可リストに無い画像形式 (SVG) を拒否する", async () => {
    const svgData = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><rect /></svg>', "utf8")

    await expect(
      payload.create({
        collection: "media",
        data: { alt: "SVG 画像" },
        file: {
          data: svgData,
          mimetype: "image/svg+xml",
          name: "logo.svg",
          size: svgData.byteLength,
        },
      }),
    ).rejects.toThrow()
  })

  it("media は許可された画像を保存できる", async () => {
    const pngData = Buffer.from(PNG_BASE64, "base64")

    const created = await payload.create({
      collection: "media",
      data: { alt: "1x1 のテスト画像" },
      file: {
        data: pngData,
        mimetype: "image/png",
        name: "constraint-test.png",
        size: pngData.byteLength,
      },
    })

    expect(created.mimeType).toBe("image/png")

    await payload.delete({ collection: "media", id: created.id })
  })
})
