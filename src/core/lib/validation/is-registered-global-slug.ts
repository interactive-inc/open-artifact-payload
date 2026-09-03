import type { GlobalSlug, Payload } from "payload"

/**
 * 実行中の設定に登録済みのグローバルかを判定する。
 * 案件ごとに登録有無が変わる slug を、型アサーションなしで Local API へ渡すために使う。
 */
export function isRegisteredGlobalSlug(slug: string, payload: Payload): slug is GlobalSlug {
  return payload.config.globals.some((global) => global.slug === slug)
}
