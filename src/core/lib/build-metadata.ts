import type { Metadata } from 'next'

import type { MediaOrId } from '@/core/lib/media/types'
import { resolveMediaUrl } from '@/core/lib/media/resolve-media-url'

type SeoMeta = {
  title?: string | null
  description?: string | null
  image?: MediaOrId
}

type Props = {
  meta: SeoMeta | null | undefined
  fallbackTitle: string
}

/**
 * SEO プラグインの meta グループ (title / description / image) を Next.js の Metadata に変換する。
 * meta が未入力でも fallbackTitle でタイトルを保証する。
 */
export function buildMetadata(props: Props): Metadata {
  const title = props.meta?.title || props.fallbackTitle
  // 空文字を渡すと <meta name="description" content=""> が出てクローラの自動抽出を阻害する。
  // null / undefined / '' いずれも未指定として扱う (title と同じく `||` で揃える)。
  const description = props.meta?.description || undefined
  const imageUrl = resolveMediaUrl(props.meta?.image)
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: imageUrl ? [{ url: imageUrl }] : undefined,
    },
  }
}
