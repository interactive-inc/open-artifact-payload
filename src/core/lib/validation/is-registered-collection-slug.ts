import type { CollectionSlug, Payload } from "payload"

/**
 * 実行中の設定に登録済みのコレクションかを判定する。
 * enableFreePages のようなフラグで登録有無が変わる slug を、型アサーションなしで
 * Local API へ渡すために使う。
 */
export function isRegisteredCollectionSlug(slug: string, payload: Payload): slug is CollectionSlug {
  return payload.config.collections.some((collection) => collection.slug === slug)
}
