import type { ServerProps } from "payload"

import { UsageSummaryPanel } from "@/core/admin/ai-translation/usage-summary-panel"

/**
 * AI翻訳ログ一覧の上部に表示する利用状況パネル。クライアントの admin も見る画面のため
 * 推定API費用の行は表示しない（原価はサービス管理者のみが AI翻訳設定側で確認する）。
 */
export function UsageSummaryBeforeList(props: ServerProps) {
  return <UsageSummaryPanel payload={props.payload} showCostRow={false} />
}
