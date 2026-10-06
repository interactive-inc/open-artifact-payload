import type { CSSProperties } from "react"

import type { MarkedListBlock } from "@/payload-types"

import { splitListItems } from "@/core/lib/rich-text/split-list-items"

type Props = { block: MarkedListBlock; style?: CSSProperties }

/**
 * 本文の記号付きリスト。番号とカタカナは順序のあるリスト、注釈は順序のないリストとして出し、
 * 記号 (1）・ア、・※) は CSS の list-style で付ける。エディタで指定した配置は Payload が style として差し込む。
 */
export function MarkedList(props: Props) {
  const items = splitListItems(props.block.items)

  if (items.length === 0) return null

  const className = `marked-list marked-list--${props.block.marker}`

  const children = items.map((item, index) => <li key={index}>{item}</li>)

  if (props.block.marker === "note") {
    return (
      <ul className={className} style={props.style}>
        {children}
      </ul>
    )
  }

  return (
    <ol className={className} style={props.style}>
      {children}
    </ol>
  )
}
