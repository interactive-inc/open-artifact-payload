import type { Payload, Where } from 'payload'

import { getJstMonthStart } from '@/core/lib/ai-translation/get-jst-month-start'
import type { UsageSnapshot } from '@/core/lib/ai-translation/translation-types'

type Props = {
  payload: Payload
  userId: number | string | null
  // クールダウン判定の対象。null なら実行ユーザー単位（旧挙動）、指定があれば同一ドキュメント・
  // 同一言語への連続実行だけを制限する（複数言語の順次翻訳を妨げないため）
  targetSlug: string | null
  targetId: string | null
  targetLocale: string | null
  now: Date
}

/**
 * 当月（日本時間）の AI 翻訳利用実績を監査ログから集計する。
 * 集計対象は「AI API を呼んだ run」= succeeded と failed の両方。
 * 失敗した run も実費が発生しているため、成功のみ数えると費用天井を突破できてしまう。
 * rejected は API を呼ぶ前の拒否なので含めない（拒否ループでクールダウンが伸び続けるのも防ぐ）。
 */
export async function loadUsageSnapshot(props: Props): Promise<UsageSnapshot> {
  const monthStartIso = getJstMonthStart(props.now).toISOString()

  const monthlyLogs = await props.payload.find({
    collection: 'ai-translation-logs',
    where: {
      and: [
        { createdAt: { greater_than_equal: monthStartIso } },
        { status: { in: ['succeeded', 'failed'] } },
      ],
    },
    pagination: false,
    depth: 0,
  })

  const monthlyCharacterCount = monthlyLogs.docs.reduce(
    (sum, log) => sum + (log.characterCount ?? 0),
    0,
  )
  const monthlyCostUsd = monthlyLogs.docs.reduce((sum, log) => sum + (log.estimatedCostUsd ?? 0), 0)

  if (props.userId === null) {
    return {
      monthlyRunCount: monthlyLogs.totalDocs,
      monthlyCharacterCount,
      monthlyCostUsd,
      lastRunAt: null,
    }
  }

  const targetConditions: Where[] = [
    ...(props.targetSlug !== null ? [{ targetSlug: { equals: props.targetSlug } }] : []),
    ...(props.targetId !== null ? [{ targetId: { equals: props.targetId } }] : []),
    ...(props.targetLocale !== null ? [{ targetLocale: { equals: props.targetLocale } }] : []),
  ]

  const lastRuns = await props.payload.find({
    collection: 'ai-translation-logs',
    where: {
      and: [
        { executedBy: { equals: props.userId } },
        { status: { in: ['succeeded', 'failed'] } },
        ...targetConditions,
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
