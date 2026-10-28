import React from "react"

type Props = {
  label: string
  value: string
  change: string
  tone: "up" | "down" | "flat"
}

/** 数字1つと、前の期間からの増減。 */
export function AnalyticsKpiTile(props: Props) {
  return (
    <div className="ictms-analytics__kpi">
      <dt className="ictms-analytics__kpi-label">{props.label}</dt>
      <dd className="ictms-analytics__kpi-value">{props.value}</dd>
      <dd className={`ictms-analytics__kpi-change ictms-analytics__kpi-change--${props.tone}`}>
        {props.change}
      </dd>
    </div>
  )
}
