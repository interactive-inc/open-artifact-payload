import type { Payload } from "payload"

import type { AnalyticsErrorKind } from "@/core/lib/analytics/analytics-error-kind"
import { ANALYTICS_STATUS_KEY } from "@/core/lib/analytics/analytics-kv-keys"
import { EMPTY_ANALYTICS_STATUS } from "@/core/lib/analytics/analytics-status-schema"
import { readAnalyticsStatus } from "@/core/lib/analytics/read-analytics-status"
import { writeAnalyticsKv } from "@/core/lib/analytics/write-analytics-kv"

type Props = {
  payload: Payload
  at: Date
  failureKind: AnalyticsErrorKind | null
}

/** 取得の成否を記録する。成功したら直近の失敗を消し、失敗したら最後の成功日時は残す。 */
export async function recordAnalyticsStatus(props: Props): Promise<null | Error> {
  const current = await readAnalyticsStatus(props.payload)

  const previous = current instanceof Error ? EMPTY_ANALYTICS_STATUS : current

  const at = props.at.toISOString()

  const next = props.failureKind
    ? { ...previous, lastFailureAt: at, lastFailureKind: props.failureKind }
    : { lastSuccessAt: at, lastFailureAt: null, lastFailureKind: null }

  return writeAnalyticsKv({ payload: props.payload, key: ANALYTICS_STATUS_KEY, value: next })
}
