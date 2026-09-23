import { z } from "zod"

/** Merge partial object edits; arrays are replaced as a whole and existing siblings survive. */
export function mergeWebMcpValues(
  current: unknown,
  patch: Record<string, unknown>,
): Record<string, unknown> {
  const existing = z.record(z.string(), z.unknown()).safeParse(current)
  const values = existing.success ? existing.data : {}

  return {
    ...values,
    ...Object.fromEntries(
      Object.entries(patch).map(([key, value]) => {
        const nested = z.record(z.string(), z.unknown()).safeParse(value)

        return [key, nested.success ? mergeWebMcpValues(values[key], nested.data) : value]
      }),
    ),
  }
}
