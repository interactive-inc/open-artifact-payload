import type { Payload, Where } from "payload"

import { pendingStaleMs } from "@/core/lib/ai-translation/expire-stale-pending-logs"
import { getJstMonthStart } from "@/core/lib/ai-translation/get-jst-month-start"
import { sumUsageLogs } from "@/core/lib/ai-translation/sum-usage-logs"
import type { UsageSnapshot } from "@/core/lib/ai-translation/translation-types"

type Props = {
  payload: Payload
  userId: number | string | null
  // クールダウン判定の対象。null なら実行ユーザー単位、指定があれば同一ドキュメント・
  // 同一言語への連続実行だけを制限する（複数言語の順次翻訳を妨げないため）
  targetKind: "collection" | "global" | null
  targetSlug: string | null
  targetId: string | null
  targetLocale: string | null
  // 自分の予約行の id。指定すると、それより前に予約された実行だけを集計する（順序付き予約）。
  // 管理画面の表示など、判定を伴わない集計では null を渡して全 pending を含める
  beforeLogId: number | null
  now: Date
}

/**
 * 当月（日本時間）の AI 翻訳利用実績を監査ログから集計する。
 * 集計対象は「AI API を呼ぶ（呼んだ）run」= pending / succeeded / failed。
 * pending は API 呼び出し前に作られる予約行で、並行リクエストが互いを見られるようにする。
 * 失敗した run も実費が発生しているため、成功のみ数えると費用天井を突破できてしまう。
 * rejected は API を呼ぶ前の拒否なので含めない（拒否ループでクールダウンが伸び続けるのも防ぐ）。
 */
export async function loadUsageSnapshot(props: Props): Promise<UsageSnapshot | Error> {
  const monthStartIso = getJstMonthStart(props.now).toISOString()
  const pendingFreshIso = new Date(props.now.getTime() - pendingStaleMs).toISOString()

  const totals = await sumUsageLogs({
    payload: props.payload,
    monthStartIso,
    pendingFreshIso,
    beforeLogId: props.beforeLogId,
  })

  if (totals instanceof Error) return totals

  if (props.userId === null) {
    return {
      monthlyRunCount: totals.runCount,
      monthlyCharacterCount: totals.characterCount,
      monthlyCostUsd: totals.costUsd,
      lastRunAt: null,
    }
  }

  const countableStatusCondition: Where = {
    or: [
      { status: { in: ["succeeded", "failed"] } },
      {
        and: [
          { status: { equals: "pending" } },
          { createdAt: { greater_than_equal: pendingFreshIso } },
        ],
      },
    ],
  }

  const orderedConditions: Where[] = [
    ...(props.beforeLogId !== null ? [{ id: { less_than: props.beforeLogId } }] : []),
    ...(props.targetKind !== null ? [{ targetKind: { equals: props.targetKind } }] : []),
    ...(props.targetSlug !== null ? [{ targetSlug: { equals: props.targetSlug } }] : []),
    ...(props.targetId !== null ? [{ targetId: { equals: props.targetId } }] : []),
    ...(props.targetLocale !== null ? [{ targetLocale: { equals: props.targetLocale } }] : []),
  ]

  const lastRuns = await props.payload.find({
    collection: "ai-translation-logs",
    where: {
      and: [
        { executedBy: { equals: props.userId } },
        countableStatusCondition,
        ...orderedConditions,
      ],
    },
    sort: "-createdAt",
    limit: 1,
    depth: 0,
  })

  const lastRun = lastRuns.docs[0] ?? null

  return {
    monthlyRunCount: totals.runCount,
    monthlyCharacterCount: totals.characterCount,
    monthlyCostUsd: totals.costUsd,
    lastRunAt: lastRun ? new Date(lastRun.createdAt) : null,
  }
}
