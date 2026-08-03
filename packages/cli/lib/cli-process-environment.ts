import { join } from 'node:path'

import { z } from 'zod'

const optionalValue = z.string().min(1).optional()

const cliProcessEnvironmentSchema = z
  .object({
    HOME: optionalValue,
    XDG_CONFIG_HOME: optionalValue,
    INTACMS_CONFIG_DIR: optionalValue,
    INTACMS_LOCAL_ENDPOINT: optionalValue,
    INTACMS_STAGING_ENDPOINT: optionalValue,
    INTACMS_STAGING_BLUE_ENDPOINT: optionalValue,
    INTACMS_PROD_ENDPOINT: optionalValue,
    OPEN_ARTIFACT_ENDPOINT: optionalValue,
    OPEN_ARTIFACT_API_KEY: optionalValue,
    OPEN_ARTIFACT_AUTH_COLLECTION: optionalValue,
  })
  .passthrough()

export type CliProcessEnvironment = z.infer<typeof cliProcessEnvironmentSchema>

export function parseCliProcessEnvironment(input: unknown): CliProcessEnvironment | Error {
  const parsed = cliProcessEnvironmentSchema.safeParse(input)
  return parsed.success ? parsed.data : new Error('Unable to read the CLI process environment')
}

export function resolveCliConfigDirectory(environment: CliProcessEnvironment): string | Error {
  if (environment.INTACMS_CONFIG_DIR) return environment.INTACMS_CONFIG_DIR
  if (environment.XDG_CONFIG_HOME) return join(environment.XDG_CONFIG_HOME, 'intacms')
  if (environment.HOME) return join(environment.HOME, '.config', 'intacms')
  return new Error('Set HOME, XDG_CONFIG_HOME, or INTACMS_CONFIG_DIR to store intacms settings')
}
