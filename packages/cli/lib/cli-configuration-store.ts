import { chmod, mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

import { z } from 'zod'

const endpointSchema = z.string().url().nullable()

const preferencesSchema = z
  .object({
    version: z.literal(1),
    prodLock: z.boolean(),
    endpoints: z.object({
      local: endpointSchema,
      staging: endpointSchema,
      stagingBlue: endpointSchema,
      prod: endpointSchema,
    }),
  })
  .strict()

const accountSchema = z
  .object({
    email: z.string().email(),
    token: z.string().min(1),
    authCollection: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  })
  .strict()

const accountsSchema = z
  .object({
    version: z.literal(1),
    accounts: z.record(z.string(), accountSchema),
  })
  .strict()

export type CliPreferences = z.infer<typeof preferencesSchema>
export type CliAccount = z.infer<typeof accountSchema>

export class CliConfigurationStore {
  private readonly preferencesPath: string
  private readonly accountsPath: string

  constructor(private readonly configDirectory: string) {
    this.preferencesPath = join(configDirectory, 'preferences.json')
    this.accountsPath = join(configDirectory, 'accounts.json')
  }

  async loadPreferences(): Promise<CliPreferences | Error> {
    const loaded = await this.readJson(this.preferencesPath)
    if (loaded === null) return defaultPreferences()
    if (loaded instanceof Error) return loaded
    const parsed = preferencesSchema.safeParse(loaded)
    return parsed.success
      ? parsed.data
      : new Error(`Invalid intacms preferences file: ${this.preferencesPath}`)
  }

  async savePreferences(preferences: CliPreferences): Promise<null | Error> {
    const parsed = preferencesSchema.safeParse(preferences)
    if (!parsed.success) return new Error('Refusing to save invalid intacms preferences')
    return await this.writeJson(this.preferencesPath, parsed.data)
  }

  async findAccount(endpoint: string): Promise<CliAccount | null | Error> {
    const accounts = await this.loadAccounts()
    if (accounts instanceof Error) return accounts
    return accounts.accounts[endpoint] ?? null
  }

  async saveAccount(endpoint: string, account: CliAccount): Promise<null | Error> {
    const parsedAccount = accountSchema.safeParse(account)
    if (!parsedAccount.success) return new Error('Refusing to save an invalid intacms account')
    const accounts = await this.loadAccounts()
    if (accounts instanceof Error) return accounts
    return await this.writeJson(this.accountsPath, {
      ...accounts,
      accounts: { ...accounts.accounts, [endpoint]: parsedAccount.data },
    })
  }

  async deleteAccount(endpoint: string): Promise<boolean | Error> {
    const accounts = await this.loadAccounts()
    if (accounts instanceof Error) return accounts
    if (accounts.accounts[endpoint] === undefined) return false
    const remaining = Object.fromEntries(
      Object.entries(accounts.accounts).filter(([accountEndpoint]) => accountEndpoint !== endpoint),
    )
    const saved = await this.writeJson(this.accountsPath, { ...accounts, accounts: remaining })
    return saved instanceof Error ? saved : true
  }

  private async loadAccounts(): Promise<z.infer<typeof accountsSchema> | Error> {
    const loaded = await this.readJson(this.accountsPath)
    if (loaded === null) return { version: 1, accounts: {} }
    if (loaded instanceof Error) return loaded
    const parsed = accountsSchema.safeParse(loaded)
    return parsed.success
      ? parsed.data
      : new Error(`Invalid intacms accounts file: ${this.accountsPath}`)
  }

  private async readJson(path: string): Promise<unknown> {
    let text: string
    try {
      text = await readFile(path, 'utf8')
      await chmod(this.configDirectory, 0o700)
      await chmod(path, 0o600)
    } catch (cause) {
      if (isMissingFileError(cause)) return null
      return new Error(`Unable to read intacms configuration: ${path}`)
    }

    try {
      return JSON.parse(text)
    } catch {
      return new Error(`Invalid JSON in intacms configuration: ${path}`)
    }
  }

  private async writeJson(path: string, value: unknown): Promise<null | Error> {
    const temporaryPath = `${path}.tmp`
    try {
      await mkdir(this.configDirectory, { recursive: true, mode: 0o700 })
      await chmod(this.configDirectory, 0o700)
      await writeFile(temporaryPath, `${JSON.stringify(value, null, 2)}\n`, {
        encoding: 'utf8',
        mode: 0o600,
      })
      await chmod(temporaryPath, 0o600)
      await rename(temporaryPath, path)
      return null
    } catch {
      return new Error(`Unable to write intacms configuration: ${path}`)
    }
  }
}

export function defaultPreferences(): CliPreferences {
  return {
    version: 1,
    prodLock: true,
    endpoints: {
      local: 'http://localhost:3000',
      staging: null,
      stagingBlue: null,
      prod: null,
    },
  }
}

function isMissingFileError(cause: unknown): boolean {
  return cause instanceof Error && 'code' in cause && cause.code === 'ENOENT'
}
