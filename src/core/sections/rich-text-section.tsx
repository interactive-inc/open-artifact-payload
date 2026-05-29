import React from 'react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

import { LexicalRenderer } from '@/core/lib/lexical'

type Props = {
  data: {
    enabled?: boolean | null
    heading?: string | null
    body?: SerializedEditorState | null
  }
}

export function RichTextSection(props: Props) {
  if (!props.data.enabled) return null
  return (
    <section className="py-16">
      <div className="max-w-3xl mx-auto px-6">
        {props.data.heading ? (
          <h2 className="text-2xl font-bold mb-6">{props.data.heading}</h2>
        ) : null}
        <LexicalRenderer value={props.data.body} />
      </div>
    </section>
  )
}
