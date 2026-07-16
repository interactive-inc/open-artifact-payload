import type { GlobalSlug, Payload } from 'payload'

/**
 * リクエストで渡された文字列が実在するグローバル slug かどうかの型ガード。
 */
export function isGlobalSlug(payload: Payload, slug: string): slug is GlobalSlug {
  return payload.config.globals.some((globalConfig) => globalConfig.slug === slug)
}
