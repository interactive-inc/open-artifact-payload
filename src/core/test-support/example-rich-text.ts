import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

// 中間変数経由で組み立てることで、オブジェクトリテラルの過剰プロパティ検査を避けつつ
// 型アサーション無しで SerializedEditorState を満たすサンプルを作る。
const headingNode = {
  type: 'heading',
  tag: 'h2',
  format: '',
  indent: 0,
  version: 1,
  direction: 'ltr',
  children: [
    {
      type: 'text',
      text: '見出しの例',
      detail: 0,
      format: 0,
      mode: 'normal',
      style: '',
      version: 1,
    },
  ],
}

const paragraphNode = {
  type: 'paragraph',
  format: '',
  indent: 0,
  version: 1,
  direction: 'ltr',
  textFormat: 0,
  children: [
    {
      type: 'text',
      text: 'これはリッチテキストの段落サンプルです。',
      detail: 0,
      format: 0,
      mode: 'normal',
      style: '',
      version: 1,
    },
  ],
}

// ターゲット型を付けることでリテラルの widening を防ぎ、アサーション無しで型を満たす。
const root: SerializedEditorState['root'] = {
  type: 'root',
  format: '',
  indent: 0,
  version: 1,
  direction: 'ltr',
  children: [headingNode, paragraphNode],
}

export const exampleRichText: SerializedEditorState = { root }
