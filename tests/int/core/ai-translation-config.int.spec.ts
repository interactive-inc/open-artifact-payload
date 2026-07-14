import { getPayload, type Payload } from 'payload'
import { beforeAll, describe, expect, it } from 'vite-plus/test'

import config from '@/payload.config'

let payload: Payload

describe('ai-translation の設定とログ', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  it('ai-translation-settings がデフォルト値で取得できる', async () => {
    const settings = await payload.findGlobal({ slug: 'ai-translation-settings' })

    expect(settings.enabled ?? false).toBe(false)
    expect(settings.model ?? 'anthropic/claude-haiku-4-5').toBe('anthropic/claude-haiku-4-5')
  })

  it('editor は ai-translation-logs を作成できない', async () => {
    const email = `ai-log-editor-${Date.now()}@example.com`
    const editor = await payload.create({
      collection: 'users',
      data: { email, password: 'test-password-1234', roles: ['editor'] },
    })

    await expect(
      payload.create({
        collection: 'ai-translation-logs',
        data: {
          targetKind: 'collection',
          targetSlug: 'news',
          sourceLocale: 'ja',
          targetLocale: 'en',
          model: 'anthropic/claude-haiku-4-5',
          status: 'succeeded',
        },
        overrideAccess: false,
        user: editor,
      }),
    ).rejects.toThrow()
  })

  it('サーバー内部（overrideAccess）ではログを作成できる', async () => {
    const created = await payload.create({
      collection: 'ai-translation-logs',
      data: {
        targetKind: 'collection',
        targetSlug: 'news',
        targetTitle: 'テスト記事',
        sourceLocale: 'ja',
        targetLocale: 'en',
        model: 'anthropic/claude-haiku-4-5',
        status: 'rejected',
        errorMessage: 'テスト用ログ',
      },
    })

    expect(created.id).toBeDefined()
    expect(created.status).toBe('rejected')
  })
})
