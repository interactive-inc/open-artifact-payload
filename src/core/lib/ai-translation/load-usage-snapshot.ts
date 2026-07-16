import type { Payload, Where } from 'payload'

import { getJstMonthStart } from '@/core/lib/ai-translation/get-jst-month-start'
import type { UsageSnapshot } from '@/core/lib/ai-translation/translation-types'

// pending 予約の有効期限。API タイムアウト（90秒）より十分長く取り、異常終了で
// finalize されなかった行が月末まで上限を消費し続けないようにする
const pendingStaleMs = 10 * 60 * 1000

type Props = {
  payload: Payload
  userId: number | string | null
  // クールダウン判定の対象。null なら実行ユーザー単位、指定があれば同一ドキュメント・
  // 同一言語への連続実行だけを制限する（複数言語の順次翻訳を妨げないため）
  targetKind: 'collection' | 'global' | null
  targetSlug: string | null
  targetId: string | null
  targetLocale: string | null
  now: Date
}

/**
 * 当月（日本時間）の AI 翻訳利用実績を監査ログから集計する。
 * 集計対象は「AI API を呼ぶ（呼んだ）run」= pending / succeeded / failed。
 * pending は API 呼び出し前に作られる予約行で、並行リクエストが互いを見られるようにする。
 * 失敗した run も実費が発生しているため、成功のみ数えると費用天井を突破できてしまう。
 * rejected は API を呼ぶ前の拒否なので含めない（拒否ループでクールダウンが伸び続けるのも防ぐ）。
 */
export async function loadUsageSnapshot(props: Props): Promise<UsageSnapshot> {
  const monthStartIso = getJstMonthStart(props.now).toISOString()
  const pendingFreshIso = new Date(props.now.getTime() - pendingStaleMs).toISOString()
  const countableStatusCondition: Where = {
    or: [
      { status: { in: ['succeeded', 'failed'] } },
      {
        and: [
          { status: { equals: 'pending' } },
          { createdAt: { greater_than_equal: pendingFreshIso } },
        ],
      },
    ],
  }

  const monthlyLogs = await props.payload.find({
    collection: 'ai-translation-logs',
    where: {
      and: [{ createdAt: { greater_than_equal: monthStartIso } }, countableStatusCondition],
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
    ...(props.targetKind !== null ? [{ targetKind: { equals: props.targetKind } }] : []),
    ...(props.targetSlug !== null ? [{ targetSlug: { equals: props.targetSlug } }] : []),
    ...(props.targetId !== null ? [{ targetId: { equals: props.targetId } }] : []),
    ...(props.targetLocale !== null ? [{ targetLocale: { equals: props.targetLocale } }] : []),
  ]

  const lastRuns = await props.payload.find({
    collection: 'ai-translation-logs',
    where: {
      and: [
        { executedBy: { equals: props.userId } },
        countableStatusCondition,
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
