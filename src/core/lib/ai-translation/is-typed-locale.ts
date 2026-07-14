import type { Payload, TypedLocale } from 'payload'

/**
 * リクエストで渡された文字列が localization 設定に存在する locale かどうかの型ガード。
 */
export function isTypedLocale(payload: Payload, code: string): code is TypedLocale {
  const localization = payload.config.localization

  if (!localization) return false

  return localization.localeCodes.includes(code)
}
