import React from "react"
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical"
import { RichText as PayloadRichText } from "@payloadcms/richtext-lexical/react"

type Props = {
  data: SerializedEditorState | null | undefined
}

/**
 * Lexical のシリアライズ済みエディタ状態を HTML にレンダリングする。
 * Payload 公式コンバータ (@payloadcms/richtext-lexical/react) に委譲しており、
 * 段落・見出し・リスト・リンク・装飾など全ノードを正しく描画する。
 */
export function RichText(props: Props) {
  if (!props.data) return null
  return (
    <div className="ictms-lexical">
      <PayloadRichText data={props.data} />
    </div>
  )
}
