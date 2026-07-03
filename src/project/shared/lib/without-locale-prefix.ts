import { defaultLocale } from '@/project/shared/lib/locale-types'
import { isLocale } from '@/project/shared/lib/is-locale'

/**
 * pathname から locale プレフィックスを取り除いた基準パスを返す。
 * 例: '/en/about' -> '/about', '/about' -> '/about', '/en' -> '/'
 */
export function withoutLocalePrefix(pathname: string): string {
  const segment = pathname.split('/')[1] ?? ''
  if (!isLocale(segment) || segment === defaultLocale) return pathname
  const rest = pathname.slice(segment.length + 1)
  return rest === '' ? '/' : rest
}
