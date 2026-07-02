import { describe, expect, it } from 'vite-plus/test'

import { submitContact } from '@/core/frontend/forms/contact-form-action'

// バリデーション失敗時は DB アクセス前に return するため Payload は不要
const passingTurnstile = { verifyTurnstile: async () => true }

describe('submitContact のバリデーション分岐', () => {
  it('空フォームなら 3 件のエラーで validationFailed を返す', async () => {
    const formData = new FormData()

    const result = await submitContact(formData, passingTurnstile)

    expect(result.status).toBe('validationFailed')
    if (result.status !== 'validationFailed') return
    expect(result.errors).toHaveLength(3)
  })

  it('メールアドレスの形式が不正なら validationFailed を返す', async () => {
    const formData = new FormData()
    formData.set('name', '山田太郎')
    formData.set('email', 'not-an-email')
    formData.set('message', 'テスト送信')

    const result = await submitContact(formData, passingTurnstile)

    expect(result.status).toBe('validationFailed')
    if (result.status !== 'validationFailed') return
    expect(result.errors.some((error) => error.includes('メールアドレス'))).toBe(true)
  })

  it('お名前が空白のみなら trim 後に空となり validationFailed を返す', async () => {
    const formData = new FormData()
    formData.set('name', '   ')
    formData.set('email', 'taro@example.com')
    formData.set('message', 'テスト送信')

    const result = await submitContact(formData, passingTurnstile)

    expect(result.status).toBe('validationFailed')
    if (result.status !== 'validationFailed') return
    expect(result.errors.some((error) => error.includes('お名前'))).toBe(true)
  })
})
