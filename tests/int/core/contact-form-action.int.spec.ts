import { getPayload, type Payload } from 'payload'
import { beforeAll, describe, expect, it, vi } from 'vite-plus/test'

import config from '@/payload.config'
import { submitContact } from '@/core/frontend/forms/contact-form-action'

let payload: Payload

describe('submitContact', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  it('必須フィールドが揃っていれば保存される', async () => {
    const formData = new FormData()
    formData.set('name', '山田太郎')
    formData.set('email', 'taro@example.com')
    formData.set('message', 'テスト送信')
    formData.set('cf-turnstile-response', 'test-token')

    const verifier = vi.fn().mockResolvedValue(true)
    const result = await submitContact(formData, { verifyTurnstile: verifier })
    expect(result.status).toBe('ok')

    const saved = await payload.find({
      collection: 'contact-submissions',
      where: { email: { equals: 'taro@example.com' } },
    })
    expect(saved.docs).toHaveLength(1)
    await payload.delete({ collection: 'contact-submissions', id: saved.docs[0].id })
    expect(verifier).toHaveBeenCalledWith('test-token')
  })

  it('Turnstile 検証に失敗したら保存しない', async () => {
    const formData = new FormData()
    formData.set('name', 'NG 太郎')
    formData.set('email', 'ng@example.com')
    formData.set('message', 'スパム')
    formData.set('cf-turnstile-response', 'bad-token')

    const verifier = vi.fn().mockResolvedValue(false)
    const result = await submitContact(formData, { verifyTurnstile: verifier })
    expect(result.status).toBe('turnstileFailed')

    const saved = await payload.find({
      collection: 'contact-submissions',
      where: { email: { equals: 'ng@example.com' } },
    })
    expect(saved.docs).toHaveLength(0)
  })
})
