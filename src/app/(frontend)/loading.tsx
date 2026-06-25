import React from 'react'

// (frontend) セグメント共通の Suspense フォールバック。
// 各ページは D1 からデータを取得する動的レンダリングのため、
// 取得中はこのスケルトンが表示され、完了後に本体がストリーミングされる。
export default function Loading() {
  return (
    <div
      className="max-w-container mx-auto px-6 py-section-sm md:py-section"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">読み込み中</span>
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-neutral-100" />
        <div className="h-4 w-full animate-pulse rounded bg-neutral-100" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-neutral-100" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-neutral-100" />
      </div>
    </div>
  )
}
