import { isLoopbackHostname, normalizeSiteManagementEndpoint } from "@open-artifact/site-management"

export { isLoopbackHostname }

export function normalizeCliEndpoint(value: string): string | Error {
  return normalizeSiteManagementEndpoint(value)
}
