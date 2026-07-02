import React from 'react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

import { RichText } from '@/core/lib/lexical'

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
    <section className="py-section-sm md:py-section">
      <div className="max-w-prose mx-auto px-6">
        {props.data.heading ? (
          <h2 className="text-2xl font-bold mb-6">{props.data.heading}</h2>
        ) : null}
        <RichText data={props.data.body} />
      </div>
    </section>
  )
}
