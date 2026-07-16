import { collectLexicalTexts } from '@/core/lib/ai-translation/collect-lexical-texts'
import { visitLexicalNode } from '@/core/lib/ai-translation/visit-lexical-node'

/**
 * Lexical JSON の複製に対して text ノードだけを翻訳文へ置き換える。
 * 構造・リンク・画像・順序は原文のまま維持される（プロンプトインジェクション対策の
 * 「構造を検証してから保存する」ガードを兼ねる）。
 */
export function applyLexicalTexts(value: unknown, texts: ReadonlyArray<string>): object | Error {
  const sourceTexts = collectLexicalTexts(value)

  if (sourceTexts.length !== texts.length) {
    return new Error('翻訳結果の数がリッチテキストの構造と一致しません')
  }

  const cloned: unknown = structuredClone(value)

  if (!cloned || typeof cloned !== 'object') {
    return new Error('リッチテキストの形式が不正です')
  }

  visitLexicalNode(cloned, [...texts])

  return cloned
}
