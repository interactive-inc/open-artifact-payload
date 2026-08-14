const router = {
  back: () => undefined,
  forward: () => undefined,
  prefetch: async () => undefined,
  push: () => undefined,
  refresh: () => undefined,
  replace: () => undefined,
}

export function useParams(): Readonly<Record<string, string | string[]>> {
  return {}
}

export function usePathname(): string {
  return "/"
}

export function useRouter() {
  return router
}

export function useSearchParams(): Readonly<URLSearchParams> {
  return new URLSearchParams()
}

export function useSelectedLayoutSegment(): null {
  return null
}

export function useSelectedLayoutSegments(): string[] {
  return []
}
