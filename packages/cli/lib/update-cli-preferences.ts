import type { CliPreferences } from "./cli-configuration-store"
import { normalizeCliEndpoint } from "./normalize-cli-endpoint"

export function updateCliPreferences(
  preferences: CliPreferences,
  key: string,
  value: string,
): CliPreferences | Error {
  if (key === "prod-lock") {
    if (value !== "true" && value !== "false") {
      return new Error("prod-lock must be true or false")
    }
    return { ...preferences, prodLock: value === "true" }
  }

  const endpointKey = toEndpointKey(key)
  if (endpointKey instanceof Error) return endpointKey
  if (value === "null" || value === "unset") {
    return {
      ...preferences,
      endpoints: { ...preferences.endpoints, [endpointKey]: null },
    }
  }

  const endpoint = normalizeCliEndpoint(value)
  if (endpoint instanceof Error) return endpoint
  return {
    ...preferences,
    endpoints: { ...preferences.endpoints, [endpointKey]: endpoint },
  }
}

function toEndpointKey(key: string): keyof CliPreferences["endpoints"] | Error {
  const endpointKeys: Readonly<Record<string, keyof CliPreferences["endpoints"]>> = {
    "endpoint.local": "local",
    "endpoint.staging": "staging",
    "endpoint.stg": "staging",
    "endpoint.beta": "staging",
    "endpoint.staging-blue": "stagingBlue",
    "endpoint.stg-blue": "stagingBlue",
    "endpoint.prod": "prod",
  }
  return endpointKeys[key] ?? new Error(`Unknown config key: ${key}`)
}
