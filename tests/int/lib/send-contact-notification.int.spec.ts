import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test'

import { sendContactNotification } from '@/core/lib/email/send-contact-notification'

const sendMock = vi.fn()

// new Resend() で生成されるため、コンストラクタとして呼べる通常関数でモックする
// (アロー関数は new できない)。関数がオブジェクトを返すと new の結果はそのオブジェクトになる。
function ResendMock() {
  return { emails: { send: sendMock } }
}

vi.mock('resend', () => ({ Resend: ResendMock }))

const payload = {
  name: '山田太郎',
  email: 'taro@example.com',
  phone: '03-0000-0000',
  companyName: 'インタ株式会社',
  inquiryType: 'service',
  message: 'サービスについて問い合わせます',
}

describe('sendContactNotification', () => {
  beforeEach(() => {
    sendMock.mockReset()
    vi.unstubAllEnvs()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('RESEND_API_KEY が未設定なら送信せず skipped を返す', async () => {
    vi.stubEnv('RESEND_API_KEY', '')
    vi.stubEnv('CONTACT_NOTIFICATION_EMAIL', 'admin@example.com')
    vi.stubEnv('CONTACT_NOTIFICATION_FROM', 'Contact <noreply@example.com>')

    const result = await sendContactNotification(payload)

    expect(result.status).toBe('skipped')
    expect(sendMock).not.toHaveBeenCalled()
  })

  it('CONTACT_NOTIFICATION_EMAIL が未設定なら送信せず skipped を返す', async () => {
    vi.stubEnv('RESEND_API_KEY', 're_test_key')
    vi.stubEnv('CONTACT_NOTIFICATION_EMAIL', '')
    vi.stubEnv('CONTACT_NOTIFICATION_FROM', 'Contact <noreply@example.com>')

    const result = await sendContactNotification(payload)

    expect(result.status).toBe('skipped')
    expect(sendMock).not.toHaveBeenCalled()
  })

  it('3 つの環境変数が揃い send が成功すれば sent を返し宛先と返信先を渡す', async () => {
    vi.stubEnv('RESEND_API_KEY', 're_test_key')
    vi.stubEnv('CONTACT_NOTIFICATION_EMAIL', 'admin@example.com')
    vi.stubEnv('CONTACT_NOTIFICATION_FROM', 'Contact <noreply@example.com>')
    sendMock.mockResolvedValue({ id: 'email_123' })

    const result = await sendContactNotification(payload)

    expect(result.status).toBe('sent')
    expect(sendMock).toHaveBeenCalledTimes(1)

    const sentArgs = sendMock.mock.calls[0][0]
    expect(sentArgs.from).toBe('Contact <noreply@example.com>')
    expect(sentArgs.to).toBe('admin@example.com')
    expect(sentArgs.replyTo).toBe('taro@example.com')
    expect(sentArgs.subject).toContain('山田太郎')
    expect(sentArgs.text).toContain('サービスについて問い合わせます')
  })

  it('send が拒否されたら例外を投げず failed をエラー文字列付きで返す', async () => {
    vi.stubEnv('RESEND_API_KEY', 're_test_key')
    vi.stubEnv('CONTACT_NOTIFICATION_EMAIL', 'admin@example.com')
    vi.stubEnv('CONTACT_NOTIFICATION_FROM', 'Contact <noreply@example.com>')
    sendMock.mockRejectedValue(new Error('Resend API error'))

    const result = await sendContactNotification(payload)

    expect(result.status).toBe('failed')
    if (result.status === 'failed') {
      expect(result.error).toBe('Resend API error')
    }
    expect(sendMock).toHaveBeenCalledTimes(1)
  })
})
