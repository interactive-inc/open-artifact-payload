import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { describe, expect, test } from 'vite-plus/test'

import { runCli } from './run-cli'

describe('runCli', () => {
  test('executes collection commands through the shared runtime', async () => {
    const configDirectory = await mkdtemp(join(tmpdir(), 'intacms-api-key-'))
    let output = ''
    let errorOutput = ''
    let requestedUrl = ''
    let authorization = ''

    const exitCode = await runCli({
      argv: ['collections', 'list', '--slug', 'news', '--prod'],
      env: {
        INTACMS_CONFIG_DIR: configDirectory,
        OPEN_ARTIFACT_ENDPOINT: 'https://example.com',
        OPEN_ARTIFACT_API_KEY: 'secret-key',
      },
      fetchPort: async (input, init) => {
        requestedUrl = input instanceof Request ? input.url : String(input)
        authorization = new Headers(init.headers).get('Authorization') ?? ''
        return new Response(JSON.stringify({ docs: [], totalDocs: 0 }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      },
      io: {
        writeOutput: (value) => {
          output += value
        },
        writeError: (value) => {
          errorOutput += value
        },
        readSecret: async () => 'password',
      },
    })

    expect(exitCode).toBe(0)
    expect(errorOutput).toBe('')
    expect(output).toContain('"totalDocs": 0')
    expect(requestedUrl).toBe('https://example.com/api/news?limit=10&page=1&draft=false&depth=0')
    expect(authorization).toBe('users API-Key secret-key')
    await rm(configDirectory, { recursive: true })
  })

  test('logs in per endpoint and uses the saved JWT for resource commands', async () => {
    const configDirectory = await mkdtemp(join(tmpdir(), 'intacms-login-'))
    const environment = { INTACMS_CONFIG_DIR: configDirectory }
    let loginAuthorization = ''
    let commandAuthorization = ''
    let commandUrl = ''

    const fetchPort = async (input: RequestInfo | URL, init: RequestInit) => {
      const url = input instanceof Request ? input.url : String(input)
      if (url === 'http://localhost:3000/api/users/login') {
        loginAuthorization = new Headers(init.headers).get('Authorization') ?? ''
        return Response.json({
          token: 'saved-session-token',
          user: { email: 'admin@example.com' },
        })
      }
      commandUrl = url
      commandAuthorization = new Headers(init.headers).get('Authorization') ?? ''
      return Response.json({ docs: [], totalDocs: 0 })
    }

    let loginOutput = ''
    const loginExitCode = await runCli({
      argv: ['login', '--local', '--email', 'admin@example.com'],
      env: environment,
      fetchPort,
      io: {
        writeOutput: (value) => {
          loginOutput += value
        },
        writeError: () => {},
        readSecret: async () => 'password',
      },
    })
    const commandExitCode = await runCli({
      argv: ['news', '--local'],
      env: environment,
      fetchPort,
      io: { writeOutput: () => {}, writeError: () => {}, readSecret: async () => 'password' },
    })

    expect(loginExitCode).toBe(0)
    expect(commandExitCode).toBe(0)
    expect(loginOutput).toContain('admin@example.com')
    expect(loginAuthorization).toBe('')
    expect(commandAuthorization).toBe('JWT saved-session-token')
    expect(commandUrl).toBe('http://localhost:3000/api/news?limit=10&page=1&draft=false&depth=0')
    await rm(configDirectory, { recursive: true })
  })

  test('requires an explicit --prod when prod-lock is enabled', async () => {
    const configDirectory = await mkdtemp(join(tmpdir(), 'intacms-prod-lock-'))
    const environment = {
      INTACMS_CONFIG_DIR: configDirectory,
      OPEN_ARTIFACT_API_KEY: 'secret-key',
    }
    const run = async (argv: ReadonlyArray<string>) => {
      let error = ''
      const exitCode = await runCli({
        argv,
        env: environment,
        fetchPort: async () => Response.json({ docs: [], totalDocs: 0 }),
        io: {
          writeOutput: () => {},
          writeError: (value) => {
            error += value
          },
          readSecret: async () => 'password',
        },
      })
      return { exitCode, error }
    }

    expect((await run(['config', 'set', 'endpoint.prod', 'https://example.com'])).exitCode).toBe(0)
    expect((await run(['config', 'set', 'prod-lock', 'true'])).exitCode).toBe(0)
    const locked = await run(['news'])
    const explicit = await run(['news', '--prod'])

    expect(locked.exitCode).toBe(1)
    expect(locked.error).toContain('Production is locked')
    expect(explicit.exitCode).toBe(0)
    await rm(configDirectory, { recursive: true })
  })

  test('revokes the server session before removing the local login', async () => {
    const configDirectory = await mkdtemp(join(tmpdir(), 'intacms-logout-'))
    let logoutAuthorization = ''
    const fetchPort = async (input: RequestInfo | URL, init: RequestInit) => {
      const url = input instanceof Request ? input.url : String(input)
      if (url.endsWith('/api/users/login')) {
        return Response.json({ token: 'revocable-token', user: { email: 'admin@example.com' } })
      }
      if (url.endsWith('/api/users/logout')) {
        logoutAuthorization = new Headers(init.headers).get('Authorization') ?? ''
        return Response.json({ message: 'Logged out' })
      }
      return Response.json({ docs: [] })
    }
    const io = {
      writeOutput: () => {},
      writeError: () => {},
      readSecret: async () => 'password',
    }

    expect(
      await runCli({
        argv: ['login', '--local', '--email', 'admin@example.com'],
        env: { INTACMS_CONFIG_DIR: configDirectory },
        fetchPort,
        io,
      }),
    ).toBe(0)
    expect(
      await runCli({
        argv: ['logout', '--local'],
        env: { INTACMS_CONFIG_DIR: configDirectory },
        fetchPort,
        io,
      }),
    ).toBe(0)
    expect(logoutAuthorization).toBe('JWT revocable-token')
    await rm(configDirectory, { recursive: true })
  })

  test('revokes the previous server session when logging in again', async () => {
    const configDirectory = await mkdtemp(join(tmpdir(), 'intacms-relogin-'))
    let loginCount = 0
    const revokedAuthorizations: string[] = []
    const fetchPort = async (input: RequestInfo | URL, init: RequestInit) => {
      const url = input instanceof Request ? input.url : String(input)
      if (url.endsWith('/api/users/login')) {
        loginCount += 1
        return Response.json({
          token: `session-token-${loginCount}`,
          user: { email: 'admin@example.com' },
        })
      }
      if (url.endsWith('/api/users/logout')) {
        revokedAuthorizations.push(new Headers(init.headers).get('Authorization') ?? '')
        return Response.json({ message: 'Logged out' })
      }
      return Response.json({ docs: [] })
    }
    const io = {
      writeOutput: () => {},
      writeError: () => {},
      readSecret: async () => 'password',
    }
    const runLogin = async () =>
      await runCli({
        argv: ['login', '--local', '--email', 'admin@example.com'],
        env: { INTACMS_CONFIG_DIR: configDirectory },
        fetchPort,
        io,
      })

    expect(await runLogin()).toBe(0)
    expect(await runLogin()).toBe(0)
    expect(revokedAuthorizations).toEqual(['JWT session-token-1'])
    await rm(configDirectory, { recursive: true })
  })

  test('requires --confirm for production deletion', async () => {
    const configDirectory = await mkdtemp(join(tmpdir(), 'intacms-delete-confirm-'))
    const environment = {
      INTACMS_CONFIG_DIR: configDirectory,
      INTACMS_PROD_ENDPOINT: 'https://example.com',
      OPEN_ARTIFACT_API_KEY: 'secret-key',
    }
    const run = async (argv: ReadonlyArray<string>) => {
      let error = ''
      const exitCode = await runCli({
        argv,
        env: environment,
        fetchPort: async () => Response.json({ id: 'document-1' }),
        io: {
          writeOutput: () => {},
          writeError: (value) => {
            error += value
          },
          readSecret: async () => 'password',
        },
      })
      return { exitCode, error }
    }

    const unconfirmed = await run(['news', 'document-1', 'delete', '--prod'])
    const confirmed = await run(['news', 'document-1', 'delete', '--prod', '--confirm'])
    expect(unconfirmed.exitCode).toBe(1)
    expect(unconfirmed.error).toContain('requires --confirm')
    expect(confirmed.exitCode).toBe(0)
    await rm(configDirectory, { recursive: true })
  })
})
