import type { Payload } from 'payload'

import { getJstMonthStart } from '@/core/lib/ai-translation/get-jst-month-start'
import type { UsageSnapshot } from '@/core/lib/ai-translation/translation-types'

type Props = {
  payload: Payload
  userId: number | string | null
  now: Date
}

/**
 * 当月（日本時間）の AI 翻訳利用実績を監査ログから集計する。
 * lastRunAt は実行ユーザーの直近の succeeded / failed のみ対象
 * （rejected を含めると拒否がクールダウンを延長し続けてしまうため）。
 */
export async function loadUsageSnapshot(props: Props): Promise<UsageSnapshot> {
  const monthStartIso = getJstMonthStart(props.now).toISOString()

  const monthlyLogs = await props.payload.find({
    collection: 'ai-translation-logs',
    where: {
      and: [
        { createdAt: { greater_than_equal: monthStartIso } },
        { status: { equals: 'succeeded' } },
      ],
    },
    pagination: false,
    depth: 0,
  })

  const monthlyCharacterCount = monthlyLogs.docs.reduce(
    (sum, log) => sum + (log.characterCount ?? 0),
    0,
  )
  const monthlyCostUsd = monthlyLogs.docs.reduce(
    (sum, log) => sum + (log.estimatedCostUsd ?? 0),
    0,
  )

  if (props.userId === null) {
    return {
      monthlyRunCount: monthlyLogs.totalDocs,
      monthlyCharacterCount,
      monthlyCostUsd,
      lastRunAt: null,
    }
  }

  const lastRuns = await props.payload.find({
    collection: 'ai-translation-logs',
    where: {
      and: [
        { executedBy: { equals: props.userId } },
        { status: { in: ['succeeded', 'failed'] } },
      ],
    },
    sort: '-createdAt',
    limit: 1,
    depth: 0,
  })

  const lastRun = lastRuns.docs[0] ?? null

  return {
    monthlyRunCount: monthlyLogs.totalDocs,
    monthlyCharacterCount,
    monthlyCostUsd,
    lastRunAt: lastRun ? new Date(lastRun.createdAt) : null,
  }
}
