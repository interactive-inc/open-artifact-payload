import type { UIFieldServerProps } from "payload"

import { UsageSummaryPanel } from "@/core/admin/ai-translation/usage-summary-panel"

/**
 * AI翻訳設定画面（サービス管理者のみ閲覧可）の利用状況フィールド。
 * 原価管理の画面なので推定API費用の行も表示する。
 */
export function UsageSummaryField(props: UIFieldServerProps) {
  return <UsageSummaryPanel payload={props.payload} showCostRow={true} />
}
