import type { Payload } from "payload"

import { getAnalyticsTrafficKey } from "@/core/lib/analytics/analytics-kv-keys"
import type { AnalyticsRange } from "@/core/lib/analytics/analytics-range"
import type { AnalyticsTrafficState } from "@/core/lib/analytics/analytics-traffic-state"
import type { Fetcher } from "@/core/lib/analytics/fetcher"
import { isAnalyticsTrafficFresh } from "@/core/lib/analytics/is-analytics-traffic-fresh"
import { readCachedAnalyticsTraffic } from "@/core/lib/analytics/read-cached-analytics-traffic"
import { refreshAnalyticsTraffic } from "@/core/lib/analytics/refresh-analytics-traffic"

type Props = {
  payload: Payload
  range: AnalyticsRange
  now: Date
  fetcher: Fetcher
  serviceAccountJson: string | undefined
  propertyId: string | null | undefined
}

/**
 * ダッシュボードに出す GA4 の結果を用意する。プロパティ ID か鍵が無ければ問い合わせない。
 * 保存から3時間以内ならそれを使い、古ければ取り直す。
 */
export async function loadAnalyticsTraffic(props: Props): Promise<AnalyticsTrafficState> {
  const propertyId = props.propertyId?.trim()

  const serviceAccountJson = props.serviceAccountJson?.trim()

  if (!propertyId || !serviceAccountJson) return { status: "not-configured" }

  const key = getAnalyticsTrafficKey(propertyId, props.range)

  const cached = await readCachedAnalyticsTraffic(props.payload, key)

  if (cached && isAnalyticsTrafficFresh({ traffic: cached, now: props.now })) {
    return { status: "ready", traffic: cached }
  }

  return refreshAnalyticsTraffic({ ...props, propertyId, serviceAccountJson, key, cached })
}
