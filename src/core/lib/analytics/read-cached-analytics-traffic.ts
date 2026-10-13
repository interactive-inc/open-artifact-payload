import type { Payload } from "payload"

import {
  analyticsTrafficSchema,
  type AnalyticsTraffic,
} from "@/core/lib/analytics/analytics-traffic-schema"

/** KV に保存した GA4 の結果を読む。無い・読めない・形が合わない場合は null。 */
export async function readCachedAnalyticsTraffic(
  payload: Payload,
  key: string,
): Promise<AnalyticsTraffic | null> {
  try {
    const parsed = analyticsTrafficSchema.safeParse(await payload.kv.get(key))

    return parsed.success ? parsed.data : null
  } catch {
    return null
  }
}
