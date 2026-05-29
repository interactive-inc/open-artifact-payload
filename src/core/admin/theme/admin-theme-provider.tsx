import React from 'react'

type Props = {
  children?: React.ReactNode
}

// 管理画面テーマの CSS は src/app/(payload)/custom.scss に集約している。
// このコンポーネントは admin.components.providers 経由で Payload に登録され、
// 将来 JS ベースのテーマロジックが必要になった場合の拡張ポイントとして残す。
export function AdminThemeProvider(props: Props) {
  return <>{props.children}</>
}
