import type { MediaOrId } from '@/core/lib/media/types'

/**
 * upload フィールドの値から画像 URL を解決する。
 * 未 populate (ID のみ) や未設定の場合は undefined を返す。
 */
export function resolveMediaUrl(value: MediaOrId): string | undefined {
  if (!value) return undefined
  if (typeof value === 'number' || typeof value === 'string') return undefined
  return value.url ?? undefined
}
