import type { JsonObject, JsonValue } from "@open-artifact/site-management"
import type { SiteResourceDefinition } from "@open-artifact/site-management"

import { coerceCliValue } from "./coerce-cli-value"
import { findSiteResource } from "./resource-catalog"
import { toCliRequest } from "./to-cli-request"

export type CliEnvironmentName = "local" | "staging" | "staging-blue" | "prod"

export type CliEnvironmentSelection = {
  name: CliEnvironmentName
  explicit: boolean
}

export type CliInvocation =
  | { kind: "help"; resourceSlug: string | null }
  | { kind: "commands"; query: string | null }
  | { kind: "config-get" }
  | { kind: "config-set"; key: string; value: string }
  | {
      kind: "login"
      selection: CliEnvironmentSelection
      email: string
      authCollection: string
    }
  | { kind: "logout"; selection: CliEnvironmentSelection }
  | { kind: "whoami"; selection: CliEnvironmentSelection }
  | {
      kind: "runtime"
      selection: CliEnvironmentSelection
      request: Request
      destructive: boolean
      confirmed: boolean
    }

type ParsedArguments = {
  positionals: ReadonlyArray<string>
  flags: Readonly<Record<string, ReadonlyArray<string>>>
}

type ExtractedEnvironment = {
  argv: ReadonlyArray<string>
  selection: CliEnvironmentSelection
  confirmed: boolean
}

const environmentAliases: Readonly<Record<string, CliEnvironmentName>> = Object.freeze({
  "--local": "local",
  "--staging": "staging",
  "--stg": "staging",
  "--beta": "staging",
  "--staging-blue": "staging-blue",
  "--stg-blue": "staging-blue",
  "--prod": "prod",
})

const flagNamePattern = /^[a-zA-Z_][a-zA-Z0-9_-]*$/
const authCollectionPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const listControlFlags = new Set(["limit", "page", "locale", "draft", "depth"])
const globalControlFlags = new Set(["locale", "draft", "depth"])

export function parseCliInvocation(argv: ReadonlyArray<string>): CliInvocation | Error {
  const environment = extractEnvironment(argv)
  if (environment instanceof Error) return environment

  if (environment.argv.length === 0) return { kind: "help", resourceSlug: null }
  const resourceSlug = findHelpResource(environment.argv)
  if (environment.argv.includes("--help") || environment.argv.includes("-h")) {
    return { kind: "help", resourceSlug }
  }

  const first = environment.argv[0]
  if (first === "commands") return parseCommands(environment.argv.slice(1))
  if (first === "config") return parseConfig(environment.argv.slice(1))
  if (first === "login") return parseLogin(environment.argv.slice(1), environment.selection)
  if (first === "logout") return parseEnvironmentOnly("logout", environment)
  if (first === "whoami") return parseEnvironmentOnly("whoami", environment)

  if (first === "collections" || first === "globals") {
    const operation = validateLegacyResource(environment.argv)
    if (operation instanceof Error) return operation
    const legacy = toCliRequest(environment.argv)
    if (legacy instanceof Error) return legacy
    return {
      kind: "runtime",
      selection: environment.selection,
      request: legacy.request,
      destructive: operation === "delete",
      confirmed: environment.confirmed,
    }
  }

  return parseResourceCommand(environment.argv, environment.selection, environment.confirmed)
}

function extractEnvironment(argv: ReadonlyArray<string>): ExtractedEnvironment | Error {
  const remaining: string[] = []
  let selected: CliEnvironmentName | null = null
  let confirmed = false

  for (const argument of argv) {
    if (argument === "--confirm" || argument === "--yes") {
      confirmed = true
      continue
    }
    const environment = environmentAliases[argument]
    if (environment === undefined) {
      remaining.push(argument)
      continue
    }
    if (selected !== null && selected !== environment) {
      return new Error("Specify only one environment flag")
    }
    selected = environment
  }

  return {
    argv: remaining,
    selection: {
      name: selected ?? "prod",
      explicit: selected !== null,
    },
    confirmed,
  }
}

function findHelpResource(argv: ReadonlyArray<string>): string | null {
  const first = argv[0]
  if (first === undefined) return null
  const resource = findSiteResource(first)
  return resource instanceof Error ? null : resource.slug
}

function parseCommands(argv: ReadonlyArray<string>): CliInvocation | Error {
  const parsed = parseArguments(argv)
  if (parsed instanceof Error) return parsed
  if (parsed.positionals.length > 0) return new Error("commands accepts only --q <query>")
  const query = readOptionalSingleFlag(parsed.flags, "q")
  if (query instanceof Error) return query
  const unknown = findUnknownFlag(parsed.flags, new Set(["q"]))
  if (unknown !== null) return new Error(`Unknown commands flag: --${unknown}`)
  return { kind: "commands", query }
}

function parseConfig(argv: ReadonlyArray<string>): CliInvocation | Error {
  const parsed = parseArguments(argv)
  if (parsed instanceof Error) return parsed
  const unknown = Object.keys(parsed.flags)[0]
  if (unknown !== undefined) return new Error(`Unknown config flag: --${unknown}`)
  if (parsed.positionals.length === 1 && parsed.positionals[0] === "get") {
    return { kind: "config-get" }
  }
  if (parsed.positionals.length === 3 && parsed.positionals[0] === "set") {
    return {
      kind: "config-set",
      key: parsed.positionals[1] ?? "",
      value: parsed.positionals[2] ?? "",
    }
  }
  return new Error("Usage: intacms config get | intacms config set <key> <value>")
}

function parseLogin(
  argv: ReadonlyArray<string>,
  selection: CliEnvironmentSelection,
): CliInvocation | Error {
  const parsed = parseArguments(argv)
  if (parsed instanceof Error) return parsed
  if (parsed.positionals.length > 0) return new Error("login accepts flags only")
  const unknown = findUnknownFlag(parsed.flags, new Set(["email", "auth-collection"]))
  if (unknown !== null) return new Error(`Unknown login flag: --${unknown}`)

  const email = readRequiredSingleFlag(parsed.flags, "email")
  if (email instanceof Error) return email
  const authCollection = readOptionalSingleFlag(parsed.flags, "auth-collection")
  if (authCollection instanceof Error) return authCollection
  if (authCollection !== null && !authCollectionPattern.test(authCollection)) {
    return new Error("--auth-collection must be a kebab-case Payload collection slug")
  }

  return {
    kind: "login",
    selection,
    email,
    authCollection: authCollection ?? "users",
  }
}

function parseEnvironmentOnly(
  kind: "logout" | "whoami",
  environment: ExtractedEnvironment,
): CliInvocation | Error {
  if (environment.argv.length !== 1) return new Error(`${kind} accepts only an environment flag`)
  return { kind, selection: environment.selection }
}

function parseResourceCommand(
  argv: ReadonlyArray<string>,
  selection: CliEnvironmentSelection,
  confirmed: boolean,
): CliInvocation | Error {
  const parsed = parseArguments(argv)
  if (parsed instanceof Error) return parsed
  const slug = parsed.positionals[0]
  if (slug === undefined) return new Error("Resource name is required")
  const resource = findSiteResource(slug)
  if (resource instanceof Error) return resource

  const request =
    resource.kind === "collection"
      ? toCollectionRequest(resource, parsed.positionals.slice(1), parsed.flags)
      : toGlobalRequest(resource, parsed.positionals.slice(1), parsed.flags)
  if (request instanceof Error) return request
  return {
    kind: "runtime",
    selection,
    request,
    destructive: new URL(request.url).pathname === "/collections/delete",
    confirmed,
  }
}

function toCollectionRequest(
  resource: SiteResourceDefinition,
  positionals: ReadonlyArray<string>,
  flags: ParsedArguments["flags"],
): Request | Error {
  if (positionals.length === 0) {
    if (!resource.operations.includes("list")) return unsupportedOperation(resource, "list")
    const body = pickControlFlags(flags, listControlFlags)
    if (body instanceof Error) return body
    return makeRequest("/collections/list", { slug: resource.slug, ...body })
  }

  if (positionals.length === 1 && positionals[0] === "create") {
    if (!resource.operations.includes("create")) return unsupportedOperation(resource, "create")
    const data = toData(flags, true)
    if (data instanceof Error) return data
    return makeRequest("/collections/create", { slug: resource.slug, data: JSON.stringify(data) })
  }

  const id = positionals[0]
  if (id === undefined) return new Error(`Usage: intacms ${resource.slug} <id>`)
  if (
    positionals.length === 1 ||
    (positionals.length === 2 && (positionals[1] === "view" || positionals[1] === "get"))
  ) {
    if (!resource.operations.includes("find")) return unsupportedOperation(resource, "find")
    const unknown = Object.keys(flags)[0]
    if (unknown !== undefined) return new Error(`Find does not accept --${unknown}`)
    return makeRequest("/collections/get", { slug: resource.slug, id })
  }
  if (positionals.length === 2 && positionals[1] === "update") {
    if (!resource.operations.includes("update")) return unsupportedOperation(resource, "update")
    const data = toData(flags, true)
    if (data instanceof Error) return data
    return makeRequest("/collections/update", {
      slug: resource.slug,
      id,
      data: JSON.stringify(data),
    })
  }
  if (positionals.length === 2 && positionals[1] === "delete") {
    if (!resource.operations.includes("delete")) return unsupportedOperation(resource, "delete")
    const unknown = Object.keys(flags)[0]
    if (unknown !== undefined) return new Error(`Delete does not accept --${unknown}`)
    return makeRequest("/collections/delete", { slug: resource.slug, id })
  }

  return new Error(
    `Usage: intacms ${resource.slug} | ${resource.slug} create | ${resource.slug} <id> [view|update|delete]`,
  )
}

function toGlobalRequest(
  resource: SiteResourceDefinition,
  positionals: ReadonlyArray<string>,
  flags: ParsedArguments["flags"],
): Request | Error {
  if (positionals.length === 0) {
    if (!resource.operations.includes("find")) return unsupportedOperation(resource, "find")
    const body = pickControlFlags(flags, globalControlFlags)
    if (body instanceof Error) return body
    return makeRequest("/globals/get", { slug: resource.slug, ...body })
  }
  if (positionals.length === 1 && positionals[0] === "update") {
    if (!resource.operations.includes("update")) return unsupportedOperation(resource, "update")
    const controls = pickControlFlags(flags, globalControlFlags, false)
    if (controls instanceof Error) return controls
    const data = toData(flags, false, globalControlFlags)
    if (data instanceof Error) return data
    return makeRequest("/globals/update", {
      slug: resource.slug,
      ...controls,
      data: JSON.stringify(data),
    })
  }
  return new Error(`Usage: intacms ${resource.slug} | intacms ${resource.slug} update`)
}

function parseArguments(argv: ReadonlyArray<string>): ParsedArguments | Error {
  const positionals: string[] = []
  const flags: Record<string, string[]> = {}
  let index = 0

  while (index < argv.length) {
    const argument = argv[index]
    if (argument === undefined) break
    if (argument === "-h") {
      addFlag(flags, "help", "true")
      index += 1
      continue
    }
    if (!argument.startsWith("--")) {
      if (argument.startsWith("-")) return new Error(`Unknown flag: ${argument}`)
      positionals.push(argument)
      index += 1
      continue
    }

    const equalsIndex = argument.indexOf("=")
    const name = argument.slice(2, equalsIndex === -1 ? undefined : equalsIndex)
    if (!flagNamePattern.test(name)) return new Error(`Invalid flag: ${argument}`)
    if (equalsIndex !== -1) {
      addFlag(flags, name, argument.slice(equalsIndex + 1))
      index += 1
      continue
    }

    const next = argv[index + 1]
    if (next === undefined || next.startsWith("--") || next === "-h") {
      addFlag(flags, name, "true")
      index += 1
      continue
    }
    addFlag(flags, name, next)
    index += 2
  }

  return { positionals, flags }
}

function addFlag(flags: Record<string, string[]>, name: string, value: string): void {
  const existing = flags[name]
  if (existing === undefined) flags[name] = [value]
  else existing.push(value)
}

function readRequiredSingleFlag(flags: ParsedArguments["flags"], name: string): string | Error {
  const value = readOptionalSingleFlag(flags, name)
  if (value instanceof Error) return value
  return value ?? new Error(`--${name} is required`)
}

function readOptionalSingleFlag(
  flags: ParsedArguments["flags"],
  name: string,
): string | null | Error {
  const values = flags[name]
  if (values === undefined) return null
  if (values.length !== 1) return new Error(`--${name} may be specified only once`)
  return values[0] ?? null
}

function findUnknownFlag(
  flags: ParsedArguments["flags"],
  allowed: ReadonlySet<string>,
): string | null {
  return Object.keys(flags).find((name) => !allowed.has(name)) ?? null
}

function pickControlFlags(
  flags: ParsedArguments["flags"],
  allowed: ReadonlySet<string>,
  rejectUnknown = true,
): Record<string, string> | Error {
  if (rejectUnknown) {
    const unknown = findUnknownFlag(flags, allowed)
    if (unknown !== null) return new Error(`Unknown read option: --${unknown}`)
  }

  const body: Record<string, string> = {}
  for (const name of allowed) {
    const value = readOptionalSingleFlag(flags, name)
    if (value instanceof Error) return value
    if (value !== null) body[name] = value
  }
  return body
}

function toData(
  flags: ParsedArguments["flags"],
  mapDraftStatus: boolean,
  excluded: ReadonlySet<string> = new Set(),
): JsonObject | Error {
  const data: Record<string, JsonValue> = {}
  for (const [flagName, values] of Object.entries(flags)) {
    if (excluded.has(flagName)) continue
    if (mapDraftStatus && flagName === "draft") {
      if (values.length !== 1) return new Error("--draft may be specified only once")
      data._status = coerceCliValue(values[0] ?? "true") === false ? "published" : "draft"
      continue
    }

    const fieldName = toFieldName(flagName)
    const coerced = values.map(coerceCliValue)
    data[fieldName] = coerced.length === 1 ? (coerced[0] ?? null) : coerced
  }
  return data
}

function toFieldName(flagName: string): string {
  return flagName.replace(/-([a-zA-Z0-9])/g, (_match, character: string) => character.toUpperCase())
}

function makeRequest(path: string, body: Record<string, string>): Request {
  return new Request(`http://cli${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

function validateLegacyResource(
  argv: ReadonlyArray<string>,
): SiteResourceDefinition["operations"][number] | Error {
  const kind = argv[0]
  const command = argv[1]
  const parsed = parseArguments(argv.slice(2))
  if (parsed instanceof Error) return parsed
  const slug = readRequiredSingleFlag(parsed.flags, "slug")
  if (slug instanceof Error) return slug
  const resource = findSiteResource(slug)
  if (resource instanceof Error) return resource
  const expectedKind = kind === "collections" ? "collection" : "global"
  if (resource.kind !== expectedKind) {
    return new Error(`${resource.slug} is a ${resource.kind}, not a ${expectedKind}`)
  }

  const operations: Readonly<Record<string, SiteResourceDefinition["operations"][number]>> =
    kind === "collections"
      ? { list: "list", get: "find", create: "create", update: "update", delete: "delete" }
      : { get: "find", update: "update" }
  const operation = command === undefined ? undefined : operations[command]
  if (operation === undefined) return new Error(`Unknown legacy operation: ${command ?? ""}`)
  if (!resource.operations.includes(operation)) return unsupportedOperation(resource, operation)
  return operation
}

function unsupportedOperation(
  resource: SiteResourceDefinition,
  operation: SiteResourceDefinition["operations"][number],
): Error {
  return new Error(`${operation} is not enabled for ${resource.slug}`)
}
