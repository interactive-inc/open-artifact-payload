import type { Metadata } from "next"

import { buildMetadata } from "@/core/lib/build-metadata"
import { buildLocaleAlternates } from "@/project/shared/lib/build-locale-alternates"

type Props = Parameters<typeof buildMetadata>[0] & {
  // locale プレフィックスなしの絶対パス。渡すと alternates.languages (hreflang) を付与する。
  basePath?: string
}

const defaultOgImage = { url: "/og-default.png", width: 1200, height: 630 }

// core の buildMetadata のラッパー。ページ側で openGraph を定義すると layout の
// デフォルト OG 画像が丸ごと上書きされて消えるため、meta.image 未設定時は
// デフォルト画像をフォールバックとして補う。
export function buildPageMetadata(props: Props): Metadata {
  const metadata = buildMetadata({ meta: props.meta, fallbackTitle: props.fallbackTitle })
  const openGraph = metadata.openGraph ?? {}
  const hasImage = "images" in openGraph && Boolean(openGraph.images)

  return {
    ...metadata,
    openGraph: hasImage ? openGraph : { ...openGraph, images: [defaultOgImage] },
    alternates: props.basePath ? { languages: buildLocaleAlternates(props.basePath) } : undefined,
  }
}
