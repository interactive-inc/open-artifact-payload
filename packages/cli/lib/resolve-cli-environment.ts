import type { CliPreferences } from './cli-configuration-store'
import type { CliEnvironmentSelection } from './parse-cli-invocation'
import type { CliProcessEnvironment } from './cli-process-environment'
import { isLoopbackHostname, normalizeCliEndpoint } from './normalize-cli-endpoint'

export type ResolvedCliEnvironment = {
  name: CliEnvironmentSelection['name']
  endpoint: string
  production: boolean
  explicitlySelected: boolean
}

export function resolveCliEnvironment(props: {
  selection: CliEnvironmentSelection
  preferences: CliPreferences
  processEnvironment: CliProcessEnvironment
}): ResolvedCliEnvironment | Error {
  const rawEndpoint =
    props.processEnvironment.OPEN_ARTIFACT_ENDPOINT ??
    endpointFromProcessEnvironment(props.selection.name, props.processEnvironment) ??
    endpointFromPreferences(props.selection.name, props.preferences)
  if (rawEndpoint === null) {
    return new Error(
      `Endpoint for ${props.selection.name} is not configured. Run intacms config set endpoint.${props.selection.name} <url>.`,
    )
  }

  const endpoint = normalizeCliEndpoint(rawEndpoint)
  if (endpoint instanceof Error) return endpoint
  const productionEndpoints = [
    props.preferences.endpoints.prod,
    props.processEnvironment.INTACMS_PROD_ENDPOINT,
  ]
    .filter((candidate): candidate is string => candidate !== null && candidate !== undefined)
    .map(normalizeCliEndpoint)
    .filter((candidate): candidate is string => !(candidate instanceof Error))
  const nonProductionEndpoints = [
    props.preferences.endpoints.local,
    props.preferences.endpoints.staging,
    props.preferences.endpoints.stagingBlue,
    props.processEnvironment.INTACMS_LOCAL_ENDPOINT,
    props.processEnvironment.INTACMS_STAGING_ENDPOINT,
    props.processEnvironment.INTACMS_STAGING_BLUE_ENDPOINT,
  ]
    .filter((candidate): candidate is string => candidate !== null && candidate !== undefined)
    .map(normalizeCliEndpoint)
    .filter((candidate): candidate is string => !(candidate instanceof Error))

  return {
    name: props.selection.name,
    endpoint,
    production:
      props.selection.name === 'prod' ||
      productionEndpoints.includes(endpoint) ||
      (!isLocalEndpoint(endpoint) && !nonProductionEndpoints.includes(endpoint)),
    explicitlySelected: props.selection.explicit,
  }
}

function endpointFromProcessEnvironment(
  name: CliEnvironmentSelection['name'],
  environment: CliProcessEnvironment,
): string | null {
  const endpoints = {
    local: environment.INTACMS_LOCAL_ENDPOINT,
    staging: environment.INTACMS_STAGING_ENDPOINT,
    'staging-blue': environment.INTACMS_STAGING_BLUE_ENDPOINT,
    prod: environment.INTACMS_PROD_ENDPOINT,
  } satisfies Record<CliEnvironmentSelection['name'], string | undefined>
  return endpoints[name] ?? null
}

function endpointFromPreferences(
  name: CliEnvironmentSelection['name'],
  preferences: CliPreferences,
): string | null {
  const endpoints = {
    local: preferences.endpoints.local,
    staging: preferences.endpoints.staging,
    'staging-blue': preferences.endpoints.stagingBlue,
    prod: preferences.endpoints.prod,
  } satisfies Record<CliEnvironmentSelection['name'], string | null>
  return endpoints[name]
}

function isLocalEndpoint(endpoint: string): boolean {
  const hostname = new URL(endpoint).hostname
  return isLoopbackHostname(hostname)
}
