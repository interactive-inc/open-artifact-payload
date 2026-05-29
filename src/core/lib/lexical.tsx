import React from 'react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

type Props = {
  value: SerializedEditorState | null | undefined
}

export { LexicalRenderer as RichText }

export function LexicalRenderer(props: Props) {
  if (!props.value) return null
  const blocks = props.value.root?.children ?? []
  return (
    <div className="ictms-lexical">
      {blocks.map((block, index) => renderBlock(block, index))}
    </div>
  )
}

function renderBlock(block: unknown, index: number): React.ReactNode {
  if (!block || typeof block !== 'object') return null
  const node = block as { type?: string; text?: string; children?: unknown[] }
  if (node.type === 'paragraph') {
    return (
      <p key={index}>
        {node.children?.map((child, childIndex) => {
          if (typeof child === 'object' && child && 'text' in child) {
            return <span key={childIndex}>{(child as { text: string }).text}</span>
          }
          return null
        })}
      </p>
    )
  }
  return null
}
