import React from 'react'

type Step = {
  title: string
  description: string
}

// 制作の進め方。番号付きの縦リズムで「どう仕事が進むか」を可視化する。
const steps: ReadonlyArray<Step> = [
  {
    title: 'ヒアリング',
    description: '課題と目標を丁寧に伺い、プロジェクトのゴールと優先順位を一緒に定義します。',
  },
  {
    title: '設計・提案',
    description: '要件を整理し、構成・スケジュール・見積もりを具体的なかたちでご提案します。',
  },
  {
    title: '制作・実装',
    description: '短いサイクルで進捗を共有しながら、品質と速度を両立して開発を進めます。',
  },
  {
    title: '運用・改善',
    description: '公開後も継続的にサポートし、データを見ながら長期的な成長を支えます。',
  },
]

export function ProcessSection() {
  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-16 max-w-2xl">
          <p className="mb-3 text-sm font-medium tracking-wide text-primary">PROCESS</p>
          <h2 className="text-3xl font-heading font-semibold tracking-tight md:text-4xl">
            私たちの進め方
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            最初のご相談から公開後の運用まで、一貫した体制で伴走します。
          </p>
        </div>
        <div className="grid gap-px overflow-hidden rounded-xl bg-border ring-1 ring-border md:grid-cols-4">
          {steps.map((step, index) => (
            <div key={step.title} className="flex flex-col gap-4 bg-card p-8">
              <span className="font-heading text-3xl font-semibold text-primary tabular-nums">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="text-lg font-semibold tracking-tight">{step.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
