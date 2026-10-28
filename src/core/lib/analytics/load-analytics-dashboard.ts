import type { Payload } from "payload"

import type { AnalyticsDashboard } from "@/core/lib/analytics/analytics-dashboard"
import type { AnalyticsRange } from "@/core/lib/analytics/analytics-range"
import { canViewAnalytics } from "@/core/lib/analytics/can-view-analytics"
import { countDailyInquiries } from "@/core/lib/analytics/count-daily-inquiries"
import type { Fetcher } from "@/core/lib/analytics/fetcher"
import { getAnalyticsPeriod } from "@/core/lib/analytics/get-analytics-period"
import { loadAnalyticsTraffic } from "@/core/lib/analytics/load-analytics-traffic"

type Props = {
  payload: Payload
  user: unknown
  range: AnalyticsRange
  now: Date
  fetcher: Fetcher
  serviceAccountJson: string | undefined
}

/**
 * 解析パネルの材料を用意する。見られないロールなら null を返し、GA4 にも問い合わせない。
 * GA4 と問い合わせ件数は並行して取得する。
 */
export async function loadAnalyticsDashboard(
  props: Props,
): Promise<AnalyticsDashboard | null | Error> {
  try {
    const settings = await props.payload.findGlobal({ slug: "analytics-settings", depth: 0 })

    if (!canViewAnalytics({ user: props.user, viewerRoles: settings.viewerRoles ?? [] }))
      return null

    const period = getAnalyticsPeriod({ range: props.range, now: props.now })

    const trafficStatePromise = loadAnalyticsTraffic({ ...props, propertyId: settings.propertyId })

    const inquiries = await countDailyInquiries({ payload: props.payload, period })

    return {
      period,
      trafficState: await trafficStatePromise,
      inquiries: inquiries instanceof Error ? null : inquiries,
    }
  } catch (error) {
    return error instanceof Error ? error : new Error("failed to load the analytics dashboard")
  }
}
