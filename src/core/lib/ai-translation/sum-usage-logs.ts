import { sql } from "@payloadcms/db-d1-sqlite"
import type { Payload } from "payload"

type Props = {
  payload: Payload
  // 当月（日本時間の月初）の ISO 文字列。created_at も同形式の ISO 文字列なので辞書順で比較できる
  monthStartIso: string
  // これより古い pending は異常終了の残骸とみなして数えない
  pendingFreshIso: string
  // 順序付き予約の基準。自分の予約 id より前の pending だけを数える（null なら全 pending）
  beforeLogId: number | null
}

export type UsageTotals = {
  runCount: number
  characterCount: number
  costUsd: number
}

/**
 * 当月の AI 翻訳利用実績を SQL 集約で数える。監査ログの全件読み込みを避けるため、
 * 件数・文字数・費用を 1 クエリで合計する。
 * 集計対象は「AI API を呼ぶ（呼んだ）run」= succeeded / failed / 有効な pending。
 * 集計できなかった場合は 0 とみなさず Error を返す（上限をすり抜けさせないため）。
 */
export async function sumUsageLogs(props: Props): Promise<UsageTotals | Error> {
  const row = await props.payload.db.drizzle
    .get(
      sql`SELECT COUNT(*) AS run_count,
        COALESCE(SUM(character_count), 0) AS character_count,
        COALESCE(SUM(estimated_cost_usd), 0) AS cost_usd
      FROM ai_translation_logs
      WHERE created_at >= ${props.monthStartIso}
        AND (
          status IN ('succeeded', 'failed')
          OR (
            status = 'pending'
            AND created_at >= ${props.pendingFreshIso}
            AND (${props.beforeLogId} IS NULL OR id < ${props.beforeLogId})
          )
        )`,
    )
    .catch((thrown: unknown) => (thrown instanceof Error ? thrown : new Error(String(thrown))))

  if (row instanceof Error) return row

  if (typeof row !== "object" || row === null) {
    return new Error("AI翻訳の利用状況を集計できませんでした")
  }

  const runCount = Reflect.get(row, "run_count")
  const characterCount = Reflect.get(row, "character_count")
  const costUsd = Reflect.get(row, "cost_usd")

  if (
    typeof runCount !== "number" ||
    typeof characterCount !== "number" ||
    typeof costUsd !== "number"
  ) {
    return new Error("AI翻訳の利用状況の集計結果が不正です")
  }

  return { runCount, characterCount, costUsd }
}
