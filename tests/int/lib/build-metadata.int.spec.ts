import { describe, expect, it } from "vite-plus/test"

import { buildMetadata } from "@/core/lib/build-metadata"
import { exampleMedia } from "@/core/test-support/example-media"

describe("buildMetadata", () => {
  it("meta が null のときは fallbackTitle をタイトルにし、OG 画像を持たない", () => {
    const metadata = buildMetadata({ meta: null, fallbackTitle: "フォールバック" })

    expect(metadata.title).toBe("フォールバック")
    expect(metadata.openGraph?.images).toBeUndefined()
  })

  it("meta に title / description があればそれを採用する", () => {
    const metadata = buildMetadata({
      meta: { title: "T", description: "D" },
      fallbackTitle: "フォールバック",
    })

    expect(metadata.title).toBe("T")
    expect(metadata.description).toBe("D")
  })

  it("meta に image があれば OG 画像をその URL で 1 件生成する", () => {
    const metadata = buildMetadata({
      meta: { image: exampleMedia },
      fallbackTitle: "フォールバック",
    })

    expect(metadata.openGraph?.images).toEqual([{ url: exampleMedia.url }])
  })
})
