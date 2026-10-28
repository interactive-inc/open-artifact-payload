import type { Payload } from "payload"

import type { AnalyticsRange } from "@/core/lib/analytics/analytics-range"
import type { AnalyticsTraffic } from "@/core/lib/analytics/analytics-traffic-schema"
import type { AnalyticsTrafficState } from "@/core/lib/analytics/analytics-traffic-state"
import { fetchAnalyticsTraffic } from "@/core/lib/analytics/fetch-analytics-traffic"
import type { Fetcher } from "@/core/lib/analytics/fetcher"
import { recordAnalyticsStatus } from "@/core/lib/analytics/record-analytics-status"
import { writeAnalyticsKv } from "@/core/lib/analytics/write-analytics-kv"

type Props = {
  payload: Payload
  range: AnalyticsRange
  propertyId: string
  serviceAccountJson: string
  key: string
  cached: AnalyticsTraffic | null
  now: Date
  fetcher: Fetcher
}

/** GA4 から取り直して保存する。失敗したら前回の結果があればそれを返し、成否を記録する。 */
export async function refreshAnalyticsTraffic(props: Props): Promise<AnalyticsTrafficState> {
  const fetched = await fetchAnalyticsTraffic(props)

  if (fetched instanceof Error) {
    // detail は状態コードやエラー名だけで、鍵・トークン・応答本文を含まない
    props.payload.logger.warn({
      msg: "GA4 からアクセス解析を取得できませんでした",
      kind: fetched.kind,
      detail: fetched.message,
    })

    await recordAnalyticsStatus({
      payload: props.payload,
      at: props.now,
      failureKind: fetched.kind,
    })

    if (props.cached) return { status: "stale", traffic: props.cached, errorKind: fetched.kind }

    return { status: "failed", errorKind: fetched.kind }
  }

  // 保存に失敗しても今回の表示には使える。次に開いたときに取り直す
  await writeAnalyticsKv({ payload: props.payload, key: props.key, value: fetched })

  await recordAnalyticsStatus({ payload: props.payload, at: props.now, failureKind: null })

  return { status: "ready", traffic: fetched }
}
