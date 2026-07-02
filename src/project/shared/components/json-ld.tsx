import React from 'react'

type Props = {
  data: Record<string, unknown>
}

// 構造化データ (JSON-LD) を script タグとして埋め込む。
// CMS 由来の文字列に "</script>" が含まれてもタグが壊れないよう "<" をエスケープする。
export function JsonLd(props: Props) {
  const json = JSON.stringify(props.data).replace(/</g, '\\u003c')

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
}
