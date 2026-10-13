"use client"

import React from "react"
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

type Props = {
  points: Array<{ label: string; current: number; previous: number }>
}

const AXIS_TICK = { fontSize: 11, fill: "var(--theme-elevation-500)" }

/** 日ごとのユーザー数の折れ線。実線が今の期間、点線が前の期間。数値は隣の表で読み上げる。 */
export function AnalyticsTrendChart(props: Props) {
  return (
    <div className="ictms-analytics__chart-canvas" aria-hidden="true">
      <ResponsiveContainer width="100%" height={200}>
        {/* 数値は隣の表で読み上げるため、グラフ側のキーボード操作（フォーカス）は持たせない */}
        <LineChart
          data={props.points}
          margin={{ top: 8, right: 8, bottom: 0, left: -16 }}
          accessibilityLayer={false}
        >
          <CartesianGrid stroke="var(--theme-elevation-100)" vertical={false} />
          <XAxis dataKey="label" tick={AXIS_TICK} minTickGap={24} tickLine={false} />
          <YAxis allowDecimals={false} tick={AXIS_TICK} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{
              background: "var(--theme-elevation-0)",
              border: "1px solid var(--theme-elevation-150)",
              borderRadius: 6,
              fontSize: 12,
            }}
          />
          <Line
            type="monotone"
            dataKey="previous"
            name="前の期間"
            stroke="var(--theme-elevation-400)"
            strokeDasharray="4 3"
            dot={false}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="current"
            name="今の期間"
            stroke="var(--theme-elevation-800)"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
