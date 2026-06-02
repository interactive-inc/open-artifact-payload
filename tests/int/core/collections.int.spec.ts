import { getPayload, type Payload } from 'payload'
import { beforeAll, describe, expect, it } from 'vite-plus/test'

import config from '@/payload.config'

let payload: Payload

describe('core collections', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  it('news コレクションで公開記事を作成できる', async () => {
    const created = await payload.create({
      collection: 'news',
      data: {
        title: 'テスト告知',
        slug: 'test-announcement',
        publishedAt: new Date().toISOString(),
        category: 'info',
      },
    })

    expect(created.title).toBe('テスト告知')
    expect(created.slug).toBe('test-announcement')

    await payload.delete({ collection: 'news', id: created.id })
  })

  it('faq コレクションで質問回答を登録できる', async () => {
    const created = await payload.create({
      collection: 'faq',
      data: {
        question: '営業時間はいつですか?',
        answer: '平日 9 時から 18 時までです。',
        category: 'general',
        order: 0,
      },
    })

    expect(created.question).toBe('営業時間はいつですか?')
    await payload.delete({ collection: 'faq', id: created.id })
  })

  it('contact-submissions コレクションに問い合わせを保存できる', async () => {
    const created = await payload.create({
      collection: 'contact-submissions',
      data: {
        name: '山田太郎',
        email: 'taro@example.com',
        message: '資料をください',
        status: 'new',
      },
    })

    expect(created.status).toBe('new')
    expect(created.name).toBe('山田太郎')
    expect(created.email).toBe('taro@example.com')
    await payload.delete({ collection: 'contact-submissions', id: created.id })
  })

  it('enableFreePages が false のとき pages コレクションは登録されない', async () => {
    const slugs = payload.config.collections.map((collection) => collection.slug)
    expect(slugs).not.toContain('pages')
  })
})
