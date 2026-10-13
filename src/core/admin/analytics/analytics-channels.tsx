import React from "react"

import type { AnalyticsTraffic } from "@/core/lib/analytics/analytics-traffic-schema"

type Props = {
  channels: AnalyticsTraffic["channels"]
}

/** 流入元ごとのセッション数。棒の長さは最も多い流入元を基準にする。 */
export function AnalyticsChannels(props: Props) {
  const max = Math.max(1, ...props.channels.map((channel) => channel.sessions))

  return (
    <section className="ictms-analytics__box">
      <h3 className="ictms-analytics__box-title">流入元</h3>
      {props.channels.length === 0 ? (
        <p className="ictms-analytics__empty">この期間のセッションはありません</p>
      ) : (
        <ul className="ictms-analytics__channels">
          {props.channels.map((channel) => (
            <li key={channel.channel} className="ictms-analytics__channel">
              <span className="ictms-analytics__channel-label">{channel.label}</span>
              <span className="ictms-analytics__channel-count">
                {channel.sessions.toLocaleString("ja-JP")}
              </span>
              <span
                className="ictms-analytics__channel-bar"
                style={{ width: `${(channel.sessions / max) * 100}%` }}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
