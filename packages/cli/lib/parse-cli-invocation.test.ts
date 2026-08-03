import { describe, expect, test } from 'vite-plus/test'

import { parseCliInvocation } from './parse-cli-invocation'

describe('parseCliInvocation', () => {
  test('maps a resource list command and environment flag to the shared runtime route', async () => {
    const result = parseCliInvocation(['news', '--local', '--limit', '25', '--draft'])

    expect(result).not.toBeInstanceOf(Error)
    if (result instanceof Error || result.kind !== 'runtime') return
    expect(result.selection).toEqual({ name: 'local', explicit: true })
    expect(new URL(result.request.url).pathname).toBe('/collections/list')
    expect(await result.request.json()).toEqual({ slug: 'news', limit: '25', draft: 'true' })
  })

  test('maps REST-style collection detail and update commands', async () => {
    const detail = parseCliInvocation(['news', 'document-1', 'view', '--stg'])
    expect(detail).not.toBeInstanceOf(Error)
    if (detail instanceof Error || detail.kind !== 'runtime') return
    expect(new URL(detail.request.url).pathname).toBe('/collections/get')
    expect(await detail.request.json()).toEqual({ slug: 'news', id: 'document-1' })

    const update = parseCliInvocation([
      'news',
      'document-1',
      'update',
      '--title',
      '変更後',
      '--display-order',
      '-1',
    ])
    expect(update).not.toBeInstanceOf(Error)
    if (update instanceof Error || update.kind !== 'runtime') return
    expect(new URL(update.request.url).pathname).toBe('/collections/update')
    expect(await update.request.json()).toEqual({
      slug: 'news',
      id: 'document-1',
      data: '{"title":"変更後","displayOrder":-1}',
    })
  })

  test('coerces write flags into a JSON body while preserving quoted numeric strings', async () => {
    const result = parseCliInvocation([
      'news',
      'create',
      '--title',
      'お知らせ',
      '--views',
      '12',
      '--featured',
      '--room',
      '"9"',
      '--tags',
      '["release","important"]',
      '--draft',
      '--local',
    ])

    expect(result).not.toBeInstanceOf(Error)
    if (result instanceof Error || result.kind !== 'runtime') return
    expect(await result.request.json()).toEqual({
      slug: 'news',
      data: '{"title":"お知らせ","views":12,"featured":true,"room":"9","tags":["release","important"],"_status":"draft"}',
    })
  })

  test('maps global get and update commands', async () => {
    const result = parseCliInvocation([
      'site-settings',
      'update',
      '--site-name',
      '新しいサイト名',
      '--locale',
      'ja',
    ])

    expect(result).not.toBeInstanceOf(Error)
    if (result instanceof Error || result.kind !== 'runtime') return
    expect(new URL(result.request.url).pathname).toBe('/globals/update')
    expect(await result.request.json()).toEqual({
      slug: 'site-settings',
      locale: 'ja',
      data: '{"siteName":"新しいサイト名"}',
    })
  })

  test('rejects conflicting environments and resources outside the allowlist', () => {
    expect(parseCliInvocation(['news', '--local', '--prod'])).toBeInstanceOf(Error)
    expect(parseCliInvocation(['users', '--local'])).toBeInstanceOf(Error)
    expect(
      parseCliInvocation([
        'login',
        '--local',
        '--email',
        'admin@example.com',
        '--auth-collection',
        '../users',
      ]),
    ).toBeInstanceOf(Error)
    expect(
      parseCliInvocation(['collections', 'list', '--slug', 'users', '--local']),
    ).toBeInstanceOf(Error)
  })

  test('accepts prompt-based login and records explicit deletion confirmation', () => {
    const login = parseCliInvocation(['login', '--local', '--email', 'admin@example.com'])
    expect(login).not.toBeInstanceOf(Error)
    if (login instanceof Error || login.kind !== 'login') return
    expect(
      parseCliInvocation(['login', '--email', 'admin@example.com', '--password', 'secret']),
    ).toBeInstanceOf(Error)

    const deletion = parseCliInvocation(['news', 'document-1', 'delete', '--prod', '--confirm'])
    expect(deletion).not.toBeInstanceOf(Error)
    if (deletion instanceof Error || deletion.kind !== 'runtime') return
    expect(deletion.destructive).toBe(true)
    expect(deletion.confirmed).toBe(true)
  })
})
