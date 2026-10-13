import type { UIFieldServerProps } from "payload"
import React from "react"

import { describeGa4ServiceAccount } from "@/core/lib/analytics/describe-ga4-service-account"
import { formatJstDateTime } from "@/core/lib/analytics/format-jst-date-time"
import { getAnalyticsErrorMessage } from "@/core/lib/analytics/get-analytics-error-message"
import { readAnalyticsStatus } from "@/core/lib/analytics/read-analytics-status"
import "@/core/admin/analytics/analytics-panel.css"

/**
 * アクセス解析設定の接続状態。鍵が設定済みか、最後に取得できた日時、直近の失敗を出す。
 * GA4 への追加作業に使うため、サービスアカウントのメールアドレスは表示する。
 */
export async function AnalyticsStatusField(props: UIFieldServerProps) {
  const status = await readAnalyticsStatus(props.payload)

  const rows = [
    {
      label: "サービスアカウント",
      value: describeGa4ServiceAccount(process.env.GA4_SERVICE_ACCOUNT_JSON),
    },
    {
      label: "最後に取得できた日時",
      value:
        status instanceof Error || !status.lastSuccessAt
          ? "まだありません"
          : formatJstDateTime(status.lastSuccessAt),
    },
    ...(status instanceof Error || !status.lastFailureAt || !status.lastFailureKind
      ? []
      : [
          {
            label: "直近の失敗",
            value: `${formatJstDateTime(status.lastFailureAt)} ${getAnalyticsErrorMessage(status.lastFailureKind)}`,
          },
        ]),
  ]

  return (
    <div className="ictms-analytics-status">
      <h3 className="ictms-analytics-status__title">接続状態</h3>
      <dl className="ictms-analytics-status__rows">
        {rows.map((row) => (
          <React.Fragment key={row.label}>
            <dt>{row.label}</dt>
            <dd>{row.value}</dd>
          </React.Fragment>
        ))}
      </dl>
    </div>
  )
}
