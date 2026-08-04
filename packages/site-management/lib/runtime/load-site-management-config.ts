import { z } from 'zod'

import { normalizeSiteManagementEndpoint } from './normalize-site-management-endpoint'

const siteManagementConfigSchema = z.object({
  OPEN_ARTIFACT_ENDPOINT: z.string().min(1),
  OPEN_ARTIFACT_API_KEY: z.string().min(1).optional(),
  OPEN_ARTIFACT_TOKEN: z.string().min(1).optional(),
  OPEN_ARTIFACT_AUTH_COLLECTION: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .default('users'),
})

export type SiteAuthentication =
  | {
      kind: 'api-key'
      apiKey: string
      authCollection: string
    }
  | {
      kind: 'jwt'
      token: string
    }

export type SiteManagementConfig = {
  endpoint: string
  authentication: SiteAuthentication
}

export function loadSiteManagementConfig(input: unknown): SiteManagementConfig | Error {
  const parsed = siteManagementConfigSchema.safeParse(input)
  if (
    !parsed.success ||
    (parsed.data.OPEN_ARTIFACT_API_KEY === undefined &&
      parsed.data.OPEN_ARTIFACT_TOKEN === undefined)
  ) {
    return new Error(
      'Set OPEN_ARTIFACT_ENDPOINT and either OPEN_ARTIFACT_API_KEY or OPEN_ARTIFACT_TOKEN before using the site tools',
    )
  }

  const endpoint = normalizeSiteManagementEndpoint(parsed.data.OPEN_ARTIFACT_ENDPOINT)
  if (endpoint instanceof Error) return endpoint

  let authentication: SiteAuthentication
  if (parsed.data.OPEN_ARTIFACT_API_KEY !== undefined) {
    authentication = {
      kind: 'api-key',
      apiKey: parsed.data.OPEN_ARTIFACT_API_KEY,
      authCollection: parsed.data.OPEN_ARTIFACT_AUTH_COLLECTION,
    }
  } else if (parsed.data.OPEN_ARTIFACT_TOKEN !== undefined) {
    authentication = { kind: 'jwt', token: parsed.data.OPEN_ARTIFACT_TOKEN }
  } else {
    return new Error(
      'Set OPEN_ARTIFACT_ENDPOINT and either OPEN_ARTIFACT_API_KEY or OPEN_ARTIFACT_TOKEN before using the site tools',
    )
  }

  return Object.freeze({
    endpoint,
    authentication: Object.freeze(authentication),
  })
}
