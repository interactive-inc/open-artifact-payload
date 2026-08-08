import { getPayload, type Payload } from 'payload'
import { beforeAll, describe, expect, it } from 'vite-plus/test'

import config from '@/payload.config'

let payload: Payload

describe('ユーザー削除時の編集ロック', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  it('ユーザーを削除すると所有していた編集ロックも削除される', async () => {
    const user = await payload.create({
      collection: 'users',
      data: {
        email: `lock-owner-${Date.now()}@example.com`,
        password: 'test-password-1234',
        roles: ['editor'],
      },
    })
    const lock = await payload.create({
      collection: 'payload-locked-documents',
      data: {
        globalSlug: 'site-settings',
        user: { relationTo: 'users', value: user.id },
      },
    })

    await payload.delete({ collection: 'users', id: user.id })

    const remainingLocks = await payload.find({
      collection: 'payload-locked-documents',
      where: { id: { equals: lock.id } },
      overrideAccess: true,
    })
    expect(remainingLocks.docs).toHaveLength(0)
  })
})
