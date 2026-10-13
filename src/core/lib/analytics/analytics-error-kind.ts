export const ANALYTICS_ERROR_KINDS = [
  "not-configured",
  "invalid-credentials",
  "unauthorized",
  "rejected",
  "rate-limited",
  "unavailable",
  "invalid-response",
] as const

export type AnalyticsErrorKind = (typeof ANALYTICS_ERROR_KINDS)[number]
