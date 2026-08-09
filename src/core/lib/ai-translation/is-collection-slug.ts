import type { CollectionSlug, Payload } from "payload"

/**
 * リクエストで渡された文字列が実在するコレクション slug かどうかの型ガード。
 * 設定に無い slug は翻訳対象にしない（allowlist はサーバー側の config が唯一の情報源）。
 */
export function isCollectionSlug(payload: Payload, slug: string): slug is CollectionSlug {
  return payload.config.collections.some((collection) => collection.slug === slug)
}
