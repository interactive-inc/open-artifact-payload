import type { AnalyticsErrorKind } from "@/core/lib/analytics/analytics-error-kind"

type Props = {
  kind: AnalyticsErrorKind
  detail: string
}

/**
 * GA4 連携の失敗。画面の表示を分けるための種類を持つ。
 * detail には鍵・トークン・GA4 の応答本文を入れない。
 */
export class AnalyticsError extends Error {
  readonly kind: AnalyticsErrorKind

  constructor(props: Props) {
    super(props.detail)
    this.name = "AnalyticsError"
    this.kind = props.kind
  }
}
