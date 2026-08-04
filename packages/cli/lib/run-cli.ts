import { SiteManagementRuntime, type FetchPort } from '@open-artifact/site-management'

import { buildCliApp } from './build-cli-app'
import { CliConfigurationStore, type CliAccount } from './cli-configuration-store'
import { CLI_HELP, buildResourceHelp } from './cli-help'
import {
  parseCliProcessEnvironment,
  resolveCliConfigDirectory,
  type CliProcessEnvironment,
} from './cli-process-environment'
import { formatCliOutput } from './format-cli-output'
import { parseCliInvocation, type CliInvocation } from './parse-cli-invocation'
import { PayloadAuthClient } from './payload-auth-client'
import { resolveCliEnvironment, type ResolvedCliEnvironment } from './resolve-cli-environment'
import { searchSiteCommands } from './resource-catalog'
import { updateCliPreferences } from './update-cli-preferences'

type CliIo = {
  writeOutput: (value: string) => void
  writeError: (value: string) => void
  readSecret: (prompt: string) => Promise<string | Error>
}

type RunCliProps = {
  argv: ReadonlyArray<string>
  env: unknown
  fetchPort: FetchPort
  io: CliIo
}

export async function runCli(props: RunCliProps): Promise<number> {
  const invocation = parseCliInvocation(props.argv)
  if (invocation instanceof Error) {
    props.io.writeError(`${invocation.message}\n`)
    return 1
  }

  if (invocation.kind === 'help') {
    props.io.writeOutput(
      invocation.resourceSlug === null ? CLI_HELP : buildResourceHelp(invocation.resourceSlug),
    )
    return 0
  }
  if (invocation.kind === 'commands') {
    writeJson(props.io, searchSiteCommands(invocation.query))
    return 0
  }

  const processEnvironment = parseCliProcessEnvironment(props.env)
  if (processEnvironment instanceof Error) return writeError(props.io, processEnvironment)
  const configDirectory = resolveCliConfigDirectory(processEnvironment)
  if (configDirectory instanceof Error) return writeError(props.io, configDirectory)
  const store = new CliConfigurationStore(configDirectory)
  const preferences = await store.loadPreferences()
  if (preferences instanceof Error) return writeError(props.io, preferences)

  if (invocation.kind === 'config-get') {
    writeJson(props.io, preferences)
    return 0
  }
  if (invocation.kind === 'config-set') {
    const updated = updateCliPreferences(preferences, invocation.key, invocation.value)
    if (updated instanceof Error) return writeError(props.io, updated)
    const saved = await store.savePreferences(updated)
    if (saved instanceof Error) return writeError(props.io, saved)
    writeJson(props.io, updated)
    return 0
  }

  const environment = resolveCliEnvironment({
    selection: invocation.selection,
    preferences,
    processEnvironment,
  })
  if (environment instanceof Error) return writeError(props.io, environment)
  if (
    preferences.prodLock &&
    environment.production &&
    !(environment.name === 'prod' && environment.explicitlySelected)
  ) {
    return writeError(
      props.io,
      new Error('Production is locked. Add --prod explicitly or disable prod-lock.'),
    )
  }
  if (
    invocation.kind === 'runtime' &&
    invocation.destructive &&
    environment.production &&
    !invocation.confirmed
  ) {
    return writeError(
      props.io,
      new Error('Production deletion requires --confirm in addition to an explicit --prod.'),
    )
  }

  if (invocation.kind === 'login') {
    return await login({ invocation, environment, store, props })
  }
  if (invocation.kind === 'logout') {
    return await logout({ environment, store, props })
  }

  const authentication = await resolveAuthentication({
    environment,
    processEnvironment,
    store,
  })
  if (authentication instanceof Error) return writeError(props.io, authentication)

  if (invocation.kind === 'whoami') {
    const user = await new PayloadAuthClient(props.fetchPort).findCurrentUser({
      endpoint: environment.endpoint,
      authorization: authentication.authorization,
      authCollection: authentication.authCollection,
    })
    if (user instanceof Error) return writeError(props.io, user)
    writeJson(props.io, user)
    return 0
  }

  const runtime = SiteManagementRuntime.build({
    env: {
      OPEN_ARTIFACT_ENDPOINT: environment.endpoint,
      OPEN_ARTIFACT_API_KEY: authentication.apiKey,
      OPEN_ARTIFACT_TOKEN: authentication.token,
      OPEN_ARTIFACT_AUTH_COLLECTION: authentication.authCollection,
    },
    fetchPort: props.fetchPort,
  })
  if (runtime instanceof Error) {
    return writeError(props.io, runtime)
  }

  const response = await buildCliApp(runtime).request(invocation.request)
  const body = await response.text()
  if (!response.ok) {
    props.io.writeError(`${body}\n`)
    return 1
  }

  const output = formatCliOutput(body)
  if (output instanceof Error) {
    props.io.writeError(`${output.message}\n`)
    return 1
  }

  props.io.writeOutput(output)
  return 0
}

type Authentication = {
  authorization: string
  authCollection: string
  apiKey: string | undefined
  token: string | undefined
}

async function login(props: {
  invocation: Extract<CliInvocation, { kind: 'login' }>
  environment: ResolvedCliEnvironment
  store: CliConfigurationStore
  props: RunCliProps
}): Promise<number> {
  const previousAccount = await props.store.findAccount(props.environment.endpoint)
  if (previousAccount instanceof Error) return writeError(props.props.io, previousAccount)

  const password = await props.props.io.readSecret('Password: ')
  if (password instanceof Error) return writeError(props.props.io, password)
  const authClient = new PayloadAuthClient(props.props.fetchPort)
  const account = await authClient.login({
    endpoint: props.environment.endpoint,
    email: props.invocation.email,
    password,
    authCollection: props.invocation.authCollection,
  })
  if (account instanceof Error) return writeError(props.props.io, account)

  if (previousAccount !== null) {
    const revokedPrevious = await authClient.logout({
      endpoint: props.environment.endpoint,
      authorization: `JWT ${previousAccount.token}`,
      authCollection: previousAccount.authCollection,
    })
    if (revokedPrevious instanceof Error) {
      await revokeNewLogin(authClient, props.environment.endpoint, account)
      return writeError(
        props.props.io,
        new Error(
          `New login cancelled because the previous session could not be revoked: ${revokedPrevious.message}`,
        ),
      )
    }
  }

  const saved = await props.store.saveAccount(props.environment.endpoint, account)
  if (saved instanceof Error) {
    await revokeNewLogin(authClient, props.environment.endpoint, account)
    return writeError(props.props.io, saved)
  }
  writeJson(props.props.io, {
    email: account.email,
    endpoint: props.environment.endpoint,
    environment: props.environment.name,
  })
  return 0
}

async function revokeNewLogin(
  authClient: PayloadAuthClient,
  endpoint: string,
  account: CliAccount,
): Promise<void> {
  await authClient.logout({
    endpoint,
    authorization: `JWT ${account.token}`,
    authCollection: account.authCollection,
  })
}

async function logout(props: {
  environment: ResolvedCliEnvironment
  store: CliConfigurationStore
  props: RunCliProps
}): Promise<number> {
  const account = await props.store.findAccount(props.environment.endpoint)
  if (account instanceof Error) return writeError(props.props.io, account)
  if (account === null) {
    writeJson(props.props.io, { endpoint: props.environment.endpoint, loggedOut: false })
    return 0
  }

  const revoked = await new PayloadAuthClient(props.props.fetchPort).logout({
    endpoint: props.environment.endpoint,
    authorization: `JWT ${account.token}`,
    authCollection: account.authCollection,
  })
  const deleted = await props.store.deleteAccount(props.environment.endpoint)
  if (deleted instanceof Error) return writeError(props.props.io, deleted)
  if (revoked instanceof Error) {
    return writeError(
      props.props.io,
      new Error(`Local session removed, but server logout failed: ${revoked.message}`),
    )
  }

  writeJson(props.props.io, { endpoint: props.environment.endpoint, loggedOut: deleted })
  return 0
}

async function resolveAuthentication(props: {
  environment: ResolvedCliEnvironment
  processEnvironment: CliProcessEnvironment
  store: CliConfigurationStore
}): Promise<Authentication | Error> {
  const apiKey = props.processEnvironment.OPEN_ARTIFACT_API_KEY
  const authCollection = props.processEnvironment.OPEN_ARTIFACT_AUTH_COLLECTION ?? 'users'
  if (apiKey !== undefined) {
    return {
      authorization: `${authCollection} API-Key ${apiKey}`,
      authCollection,
      apiKey,
      token: undefined,
    }
  }

  const account = await props.store.findAccount(props.environment.endpoint)
  if (account instanceof Error) return account
  if (account === null) {
    return new Error(
      `Not logged in to ${props.environment.endpoint}. Run intacms login --${props.environment.name} --email <email>.`,
    )
  }
  return authenticationFromAccount(account)
}

function authenticationFromAccount(account: CliAccount): Authentication {
  return {
    authorization: `JWT ${account.token}`,
    authCollection: account.authCollection,
    apiKey: undefined,
    token: account.token,
  }
}

function writeJson(io: CliIo, value: unknown): void {
  io.writeOutput(`${JSON.stringify(value, null, 2)}\n`)
}

function writeError(io: CliIo, error: Error): 1 {
  io.writeError(`${error.message}\n`)
  return 1
}
