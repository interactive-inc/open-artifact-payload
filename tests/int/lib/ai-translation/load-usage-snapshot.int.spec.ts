import { getPayload, type Payload } from 'payload'
import { beforeAll, describe, expect, it } from 'vite-plus/test'

import config from '@/payload.config'
import { loadUsageSnapshot } from '@/core/lib/ai-translation/load-usage-snapshot'

let payload: Payload

const createLog = async (props: {
  status: 'succeeded' | 'failed' | 'rejected'
  characterCount: number
  estimatedCostUsd: number
  executedBy: number
}) => {
  await payload.create({
    collection: 'ai-translation-logs',
    data: {
      targetKind: 'collection',
      targetSlug: 'news',
      targetTitle: 'usage-snapshot-test',
      executedBy: props.executedBy,
      sourceLocale: 'ja',
      targetLocale: 'en',
      model: 'anthropic/claude-haiku-4-5',
      status: props.status,
      characterCount: props.characterCount,
      estimatedCostUsd: props.estimatedCostUsd,
    },
  })
}

describe('loadUsageSnapshot', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  it('succeeded ログだけを当月の実行回数・文字数・費用として集計する', async () => {
    const user = await payload.create({
      collection: 'users',
      data: {
        email: `usage-snapshot-${Date.now()}@example.com`,
        password: 'test-password-1234',
        roles: ['editor'],
      },
    })

    const now = new Date()
    const before = await loadUsageSnapshot({ payload, userId: user.id, now })

    await createLog({ status: 'succeeded', characterCount: 100, estimatedCostUsd: 0.01, executedBy: user.id })
    await createLog({ status: 'succeeded', characterCount: 50, estimatedCostUsd: 0.02, executedBy: user.id })
    await createLog({ status: 'rejected', characterCount: 999, estimatedCostUsd: 0, executedBy: user.id })

    const after = await loadUsageSnapshot({ payload, userId: user.id, now })

    expect(after.monthlyRunCount - before.monthlyRunCount).toBe(2)
    expect(after.monthlyCharacterCount - before.monthlyCharacterCount).toBe(150)
    expect(after.monthlyCostUsd - before.monthlyCostUsd).toBeCloseTo(0.03, 5)
  })

  it('lastRunAt は succeeded / failed のみ対象（rejected では更新されない）', async () => {
    const user = await payload.create({
      collection: 'users',
      data: {
        email: `usage-lastrun-${Date.now()}@example.com`,
        password: 'test-password-1234',
        roles: ['editor'],
      },
    })

    const now = new Date()

    await createLog({ status: 'rejected', characterCount: 1, estimatedCostUsd: 0, executedBy: user.id })

    const afterRejected = await loadUsageSnapshot({ payload, userId: user.id, now })

    expect(afterRejected.lastRunAt).toBeNull()

    await createLog({ status: 'failed', characterCount: 1, estimatedCostUsd: 0, executedBy: user.id })

    const afterFailed = await loadUsageSnapshot({ payload, userId: user.id, now })

    expect(afterFailed.lastRunAt).not.toBeNull()
  })

  it('userId が null なら lastRunAt を調べない（集計のみ）', async () => {
    const snapshot = await loadUsageSnapshot({ payload, userId: null, now: new Date() })

    expect(snapshot.lastRunAt).toBeNull()
    expect(snapshot.monthlyRunCount).toBeGreaterThanOrEqual(0)
  })
})
