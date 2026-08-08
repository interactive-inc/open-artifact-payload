import { getPayload, type Payload } from 'payload'
import { beforeAll, describe, expect, it } from 'vite-plus/test'

import config from '@/payload.config'

let payload: Payload

describe('drafts', () => {
  // Note: pages collection is feature-flagged off by default (enableFreePages: false)
  // so its draft behavior is only validated when a project enables the flag.

  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  it('news で下書きを作成できる', async () => {
    const slug = `draft-test-${Date.now()}`

    const draft = await payload.create({
      collection: 'news',
      data: {
        title: '下書き記事',
        slug,
        publishedAt: new Date().toISOString(),
        category: 'info',
        _status: 'draft',
      },
      draft: true,
    })

    expect(draft._status).toBe('draft')

    const onlyPublished = await payload.find({
      collection: 'news',
      where: {
        and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }],
      },
    })
    expect(onlyPublished.docs).toHaveLength(0)

    await payload.delete({ collection: 'news', id: draft.id })
  })

  it('works の下書きは匿名の一覧取得から除外される', async () => {
    const unique = Date.now()
    const draft = await payload.create({
      collection: 'works',
      data: {
        title: '非公開の制作実績',
        slug: `private-work-${unique}`,
        category: 'web',
        publishedAt: new Date().toISOString(),
        _status: 'draft',
      },
      draft: true,
    })
    const published = await payload.create({
      collection: 'works',
      data: {
        title: '公開済みの制作実績',
        slug: `published-work-${unique}`,
        category: 'web',
        publishedAt: new Date().toISOString(),
        _status: 'published',
      },
    })

    try {
      const anonymousResult = await payload.find({
        collection: 'works',
        where: {
          slug: { in: [draft.slug, published.slug] },
        },
        overrideAccess: false,
      })

      expect(anonymousResult.docs.map((doc) => doc.slug)).toEqual([published.slug])
    } finally {
      await payload.delete({ collection: 'works', id: draft.id })
      await payload.delete({ collection: 'works', id: published.id })
    }
  })

  it('home-page グローバルでドラフトを作成できる', async () => {
    const draft = await payload.updateGlobal({
      slug: 'home-page',
      data: {
        hero: {
          enabled: true,
          title: '下書きトップ',
        },
      },
      draft: true,
    })
    expect(draft._status).toBe('draft')
  })
})
