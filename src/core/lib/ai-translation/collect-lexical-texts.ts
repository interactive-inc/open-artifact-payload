/**
 * Lexical のリッチテキスト JSON から text ノードの文字列を走査順（text → children → root）
 * で収集する。構造・リンク・画像などは対象にしない。applyLexicalTexts と走査順を揃えること。
 */
export function collectLexicalTexts(value: unknown): string[] {
  if (!value || typeof value !== "object") return []

  const texts: string[] = []

  if (Array.isArray(value)) {
    for (const child of value) texts.push(...collectLexicalTexts(child))

    return texts
  }

  if ("text" in value && typeof value.text === "string") texts.push(value.text)

  if ("children" in value) texts.push(...collectLexicalTexts(value.children))

  if ("root" in value) texts.push(...collectLexicalTexts(value.root))

  return texts
}
