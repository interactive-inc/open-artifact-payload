import type { CliPreferences } from "./cli-configuration-store"
import type { CliProcessEnvironment } from "./cli-process-environment"
import { resolveCliEnvironment, type ResolvedCliEnvironment } from "./resolve-cli-environment"

type Props = {
  environment: ResolvedCliEnvironment
  processEnvironment: CliProcessEnvironment
  preferences: CliPreferences
}

/** Basic credentials belong to the selected environment's configured URL, never a legacy override. */
export function resolveCliBasicAuthorization(props: Props): string | null | Error {
  const prefix = `INTACMS_${props.environment.name.replaceAll("-", "_").toUpperCase()}_BASIC_AUTH`
  const username = props.processEnvironment[`${prefix}_USERNAME`]
  const password = props.processEnvironment[`${prefix}_PASSWORD`]

  if (username === undefined && password === undefined) return null
  if (typeof username !== "string" || typeof password !== "string" || username.includes(":")) {
    return new Error(`Set both ${prefix}_USERNAME (without ':') and ${prefix}_PASSWORD`)
  }

  const configured = resolveCliEnvironment({
    selection: { name: props.environment.name, explicit: true },
    preferences: props.preferences,
    processEnvironment: { ...props.processEnvironment, OPEN_ARTIFACT_ENDPOINT: undefined },
  })
  if (configured instanceof Error) return configured
  if (configured.endpoint !== props.environment.endpoint) {
    return new Error("Basic authentication cannot be sent to a different OPEN_ARTIFACT_ENDPOINT")
  }
  if (new URL(configured.endpoint).protocol !== "https:") {
    return new Error("Basic authentication requires an HTTPS endpoint")
  }

  return `Basic ${Buffer.from(`${username}:${password}`, "utf8").toString("base64")}`
}
