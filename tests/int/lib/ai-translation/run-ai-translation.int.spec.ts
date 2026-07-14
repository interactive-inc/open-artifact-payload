import { getPayload, type Payload } from 'payload'
import { beforeAll, describe, expect, it } from 'vite-plus/test'

import config from '@/payload.config'
import { runAiTranslation } from '@/core/lib/ai-translation/run-ai-translation'
import type { TranslateFn } from '@/core/lib/ai-translation/translation-types'
import type { User } from '@/payload-types'

let payload: Payload
let admin: User
let newsId: string

const fakeTranslateFn: TranslateFn = (request) =>
  Promise.resolve({
    translations: request.units.map((unit) => `EN:${unit}`),
    inputTokens: 10,
    outputTokens: 5,
  })

const buildLexicalBody = (text: string) => ({
  root: {
    type: 'root',
    children: [
      {
        type: 'paragraph',
        version: 1,
        children: [{ type: 'text', text, version: 1 }],
      },
    ],
    direction: null,
    format: '' as const,
    indent: 0,
    version: 1,
  },
})

const enableSettings = async (overrides?: { monthlyRunLimit?: number }) => {
  await payload.updateGlobal({
    slug: 'ai-translation-settings',
    data: {
      enabled: true,
      model: 'anthropic/claude-haiku-4-5',
      limits: {
        monthlyRunLimit: overrides?.monthlyRunLimit ?? 10000,
        monthlyCharacterLimit: 10000000,
        monthlyCostLimitUsd: 10000,
        perRunCharacterLimit: 100000,
        cooldownSeconds: 0,
      },
    },
  })
}

describe('runAiTranslation', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })

    admin = await payload.create({
      collection: 'users',
      data: {
        email: `run-ai-${Date.now()}@example.com`,
        password: 'test-password-1234',
        roles: ['admin'],
      },
    })

    const created = await payload.create({
      collection: 'news',
      data: {
        title: 'お知らせタイトル',
        slug: `run-ai-${Date.now()}`,
        publishedAt: new Date().toISOString(),
        category: 'info',
        body: buildLexicalBody('本文です'),
        _status: 'published',
      },
      locale: 'ja',
    })

    newsId = String(created.id)
  })

  it('設定が無効なら Error を返し何も保存しない', async () => {
    await payload.updateGlobal({
      slug: 'ai-translation-settings',
      data: { enabled: false },
    })

    const outcome = await runAiTranslation({
      payload,
      user: admin,
      request: {
        targetKind: 'collection',
        targetSlug: 'news',
        targetId: newsId,
        targetLocale: 'en',
        overwrite: false,
      },
      translateFn: fakeTranslateFn,
    })

    expect(outcome).toBeInstanceOf(Error)
    if (outcome instanceof Error) expect(outcome.message).toContain('無効')
  })

  it('未入力の localized フィールドを翻訳して翻訳先 locale に保存する', async () => {
    await enableSettings()

    const outcome = await runAiTranslation({
      payload,
      user: admin,
      request: {
        targetKind: 'collection',
        targetSlug: 'news',
        targetId: newsId,
        targetLocale: 'en',
        overwrite: false,
      },
      translateFn: fakeTranslateFn,
    })

    if (outcome instanceof Error) throw outcome

    expect(outcome.status).toBe('succeeded')
    expect(outcome.translatedFieldCount).toBeGreaterThanOrEqual(2)

    const enDoc = await payload.findByID({
      collection: 'news',
      id: newsId,
      locale: 'en',
      fallbackLocale: false,
      draft: true,
      depth: 0,
    })

    expect(enDoc.title).toBe('EN:お知らせタイトル')
    expect(JSON.stringify(enDoc.body)).toContain('EN:本文です')

    const jaDoc = await payload.findByID({
      collection: 'news',
      id: newsId,
      locale: 'ja',
      fallbackLocale: false,
      draft: true,
      depth: 0,
    })

    expect(jaDoc.title).toBe('お知らせタイトル')

    const logs = await payload.find({
      collection: 'ai-translation-logs',
      where: {
        and: [{ targetId: { equals: newsId } }, { status: { equals: 'succeeded' } }],
      },
      sort: '-createdAt',
      limit: 1,
      depth: 0,
    })

    const log = logs.docs[0]

    expect(log).toBeDefined()
    expect(log?.executedBy).toBe(admin.id)
    expect(log?.characterCount).toBe('お知らせタイトル'.length + '本文です'.length)
    expect(log?.estimatedCostUsd).toBeGreaterThan(0)
  })

  it('入力済みフィールドは overwrite=false ではスキップされる', async () => {
    await enableSettings()

    const outcome = await runAiTranslation({
      payload,
      user: admin,
      request: {
        targetKind: 'collection',
        targetSlug: 'news',
        targetId: newsId,
        targetLocale: 'en',
        overwrite: false,
      },
      translateFn: (request) =>
        Promise.resolve({
          translations: request.units.map((unit) => `EN2:${unit}`),
          inputTokens: 10,
          outputTokens: 5,
        }),
    })

    if (outcome instanceof Error) throw outcome

    expect(outcome.status).toBe('skipped')

    const enDoc = await payload.findByID({
      collection: 'news',
      id: newsId,
      locale: 'en',
      fallbackLocale: false,
      draft: true,
      depth: 0,
    })

    expect(enDoc.title).toBe('EN:お知らせタイトル')
  })

  it('overwrite=true なら既存翻訳を上書きする', async () => {
    await enableSettings()

    const outcome = await runAiTranslation({
      payload,
      user: admin,
      request: {
        targetKind: 'collection',
        targetSlug: 'news',
        targetId: newsId,
        targetLocale: 'en',
        overwrite: true,
      },
      translateFn: (request) =>
        Promise.resolve({
          translations: request.units.map((unit) => `EN2:${unit}`),
          inputTokens: 10,
          outputTokens: 5,
        }),
    })

    if (outcome instanceof Error) throw outcome

    expect(outcome.status).toBe('succeeded')

    const enDoc = await payload.findByID({
      collection: 'news',
      id: newsId,
      locale: 'en',
      fallbackLocale: false,
      draft: true,
      depth: 0,
    })

    expect(enDoc.title).toBe('EN2:お知らせタイトル')
  })

  it('月間実行回数の上限に達していると rejected ログを残して Error', async () => {
    await enableSettings({ monthlyRunLimit: 0 })

    const outcome = await runAiTranslation({
      payload,
      user: admin,
      request: {
        targetKind: 'collection',
        targetSlug: 'news',
        targetId: newsId,
        targetLocale: 'en',
        overwrite: true,
      },
      translateFn: fakeTranslateFn,
    })

    expect(outcome).toBeInstanceOf(Error)
    if (outcome instanceof Error) expect(outcome.message).toContain('回数')

    const logs = await payload.find({
      collection: 'ai-translation-logs',
      where: {
        and: [{ targetId: { equals: newsId } }, { status: { equals: 'rejected' } }],
      },
      sort: '-createdAt',
      limit: 1,
      depth: 0,
    })

    expect(logs.docs[0]).toBeDefined()
  })

  it('翻訳結果の件数不一致は failed ログを残し、既存データを変更しない', async () => {
    await enableSettings()

    const outcome = await runAiTranslation({
      payload,
      user: admin,
      request: {
        targetKind: 'collection',
        targetSlug: 'news',
        targetId: newsId,
        targetLocale: 'en',
        overwrite: true,
      },
      translateFn: () =>
        Promise.resolve({ translations: ['only-one'], inputTokens: 1, outputTokens: 1 }),
    })

    expect(outcome).toBeInstanceOf(Error)

    const enDoc = await payload.findByID({
      collection: 'news',
      id: newsId,
      locale: 'en',
      fallbackLocale: false,
      draft: true,
      depth: 0,
    })

    expect(enDoc.title).toBe('EN2:お知らせタイトル')

    const logs = await payload.find({
      collection: 'ai-translation-logs',
      where: {
        and: [{ targetId: { equals: newsId } }, { status: { equals: 'failed' } }],
      },
      sort: '-createdAt',
      limit: 1,
      depth: 0,
    })

    expect(logs.docs[0]).toBeDefined()
  })

  it('翻訳先言語が defaultLocale や未定義の locale なら Error', async () => {
    await enableSettings()

    const toJa = await runAiTranslation({
      payload,
      user: admin,
      request: {
        targetKind: 'collection',
        targetSlug: 'news',
        targetId: newsId,
        targetLocale: 'ja',
        overwrite: false,
      },
      translateFn: fakeTranslateFn,
    })

    expect(toJa).toBeInstanceOf(Error)

    const toUnknown = await runAiTranslation({
      payload,
      user: admin,
      request: {
        targetKind: 'collection',
        targetSlug: 'news',
        targetId: newsId,
        targetLocale: 'fr',
        overwrite: false,
      },
      translateFn: fakeTranslateFn,
    })

    expect(toUnknown).toBeInstanceOf(Error)
  })
})
