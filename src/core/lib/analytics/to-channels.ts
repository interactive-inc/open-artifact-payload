import type { AnalyticsTraffic } from "@/core/lib/analytics/analytics-traffic-schema"
import { getChannelLabel } from "@/core/lib/analytics/get-channel-label"
import { toMetricNumber } from "@/core/lib/analytics/to-metric-number"

/** 流入元の行に日本語の表示名を付ける。 */
export function toChannels(rows: Array<Record<string, string>>): AnalyticsTraffic["channels"] {
  return rows.map((row) => {
    const channel = row.sessionDefaultChannelGroup ?? ""

    return { channel, label: getChannelLabel(channel), sessions: toMetricNumber(row.sessions) }
  })
}
