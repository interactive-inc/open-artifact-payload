const SLUG_PATTERN = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/

export function assertSlug(value: string): void {
  if (!SLUG_PATTERN.test(value)) {
    throw new Error(`不正な slug です: ${value}`)
  }
}
