import type { Media } from '@/payload-types'

type MediaOrId = Media | number | string | null | undefined

export function resolveMediaUrl(value: MediaOrId): string | undefined {
  if (!value) return undefined
  if (typeof value === 'number' || typeof value === 'string') return undefined
  return value.url ?? undefined
}

export function resolveMediaAlt(value: MediaOrId): string | undefined {
  if (!value) return undefined
  if (typeof value === 'number' || typeof value === 'string') return undefined
  return value.alt ?? undefined
}
