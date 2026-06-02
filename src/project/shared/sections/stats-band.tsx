import React from 'react'

type Stat = {
  value: string
  label: string
}

// 実績数字の帯。背景のグラデーションの上に大きな数値を並べて信頼感を出す。
// 数値はサンプル。本番では CMS 化するか実数に差し替える。
const stats: ReadonlyArray<Stat> = [
  { value: '120+', label: '手がけたプロジェクト' },
  { value: '15年', label: '創業からの実績' },
  { value: '98%', label: 'クライアント継続率' },
  { value: '40名', label: '専門スタッフ' },
]

export function StatsBand() {
  return (
    <section className="relative isolate overflow-hidden bg-[oklch(0.22_0.06_268)] text-background">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(110deg,oklch(0.28_0.12_268)_0%,oklch(0.2_0.08_280)_100%)]"
      />
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-y-12 px-6 py-20 md:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col items-center text-center">
            <span className="text-4xl font-bold tracking-tight md:text-5xl">{stat.value}</span>
            <span className="mt-2 text-sm text-background/70">{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
