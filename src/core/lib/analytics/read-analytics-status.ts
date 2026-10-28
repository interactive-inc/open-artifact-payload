import type { Payload } from "payload"

import { ANALYTICS_STATUS_KEY } from "@/core/lib/analytics/analytics-kv-keys"
import {
  analyticsStatusSchema,
  EMPTY_ANALYTICS_STATUS,
  type AnalyticsStatus,
} from "@/core/lib/analytics/analytics-status-schema"

/** KV に記録した取得状況を読む。記録が無い・形が合わない場合は空の状況として扱う。 */
export async function readAnalyticsStatus(payload: Payload): Promise<AnalyticsStatus | Error> {
  try {
    const parsed = analyticsStatusSchema.safeParse(await payload.kv.get(ANALYTICS_STATUS_KEY))

    return parsed.success ? parsed.data : EMPTY_ANALYTICS_STATUS
  } catch (error) {
    return error instanceof Error ? error : new Error("failed to read the analytics status")
  }
}
