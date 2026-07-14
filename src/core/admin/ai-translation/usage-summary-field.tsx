import type { UIFieldServerProps } from 'payload'

import { loadUsageSnapshot } from '@/core/lib/ai-translation/load-usage-snapshot'

/**
 * AI翻訳設定画面に当月の利用状況（実行回数・文字数・推定費用）を表示する読み取り専用パネル。
 * サーバーコンポーネントとしてリクエスト時に集計する（ハイドレーションなし）。
 */
export async function UsageSummaryField(props: UIFieldServerProps) {
  const settings = await props.payload.findGlobal({ slug: 'ai-translation-settings', depth: 0 })
  // サーバー専用レンダリングのため new Date() を使ってもハイドレーション不整合は起きない
  const snapshot = await loadUsageSnapshot({
    payload: props.payload,
    userId: null,
    now: new Date(),
  })

  const limits = settings.limits
  const rows = [
    {
      label: '翻訳実行回数',
      value: `${snapshot.monthlyRunCount} / ${limits?.monthlyRunLimit ?? '未設定'} 回`,
    },
    {
      label: '翻訳文字数',
      value: `${snapshot.monthlyCharacterCount.toLocaleString('ja-JP')} / ${(limits?.monthlyCharacterLimit ?? 0).toLocaleString('ja-JP')} 文字`,
    },
    {
      label: '推定API費用',
      value: `$${snapshot.monthlyCostUsd.toFixed(4)} / $${limits?.monthlyCostLimitUsd ?? '未設定'}`,
    },
  ]

  return (
    <div
      style={{
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: '4px',
        padding: '16px',
        marginBottom: '24px',
      }}
    >
      <h3 style={{ margin: '0 0 12px' }}>今月の利用状況</h3>
      <p style={{ margin: '0 0 12px', color: 'var(--theme-elevation-500)', fontSize: '13px' }}>
        日本時間の月初から集計。上限に達すると AI API を呼び出す前に翻訳を停止します。
      </p>
      <dl
        style={{
          display: 'grid',
          gridTemplateColumns: 'max-content 1fr',
          gap: '4px 16px',
          margin: 0,
        }}
      >
        {rows.map((row) => (
          <div key={row.label} style={{ display: 'contents' }}>
            <dt style={{ color: 'var(--theme-elevation-500)' }}>{row.label}</dt>
            <dd style={{ margin: 0 }}>{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
