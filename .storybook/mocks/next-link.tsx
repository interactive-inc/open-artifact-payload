import type { AnchorHTMLAttributes, ReactNode } from "react"

type UrlObject = {
  hash?: string
  pathname?: string
  query?: Record<string, string | number | boolean | null | undefined>
}

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  children?: ReactNode
  href: string | URL | UrlObject
  onNavigate?: unknown
  prefetch?: boolean | null
  replace?: boolean
  scroll?: boolean
  shallow?: boolean
}

function resolveHref(href: Props["href"]): string {
  if (typeof href === "string") return href
  if (href instanceof URL) return href.toString()

  const pathname = href.pathname ?? ""
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(href.query ?? {})) {
    if (value !== undefined && value !== null) query.set(key, String(value))
  }
  const search = query.size > 0 ? `?${query.toString()}` : ""
  const hash = href.hash ? (href.hash.startsWith("#") ? href.hash : `#${href.hash}`) : ""
  return `${pathname}${search}${hash}`
}

export default function NextLink({
  href,
  onNavigate: _onNavigate,
  prefetch: _prefetch,
  replace: _replace,
  scroll: _scroll,
  shallow: _shallow,
  ...anchorProps
}: Props) {
  return <a {...anchorProps} href={resolveHref(href)} />
}
