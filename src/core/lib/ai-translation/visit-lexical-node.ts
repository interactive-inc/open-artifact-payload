/**
 * Lexical ノードを collectLexicalTexts と同一の走査順（text → children → root）で辿り、
 * text ノードを remainingTexts の先頭から順に破壊的に置き換える。
 * applyLexicalTexts 専用の内部ヘルパー（クローン済みノードにのみ使う）。
 */
export function visitLexicalNode(node: unknown, remainingTexts: string[]): void {
  if (!node || typeof node !== "object") return

  if (Array.isArray(node)) {
    for (const child of node) visitLexicalNode(child, remainingTexts)

    return
  }

  if ("text" in node && typeof node.text === "string") {
    const nextText = remainingTexts.shift()

    if (nextText !== undefined) node.text = nextText
  }

  if ("children" in node) visitLexicalNode(node.children, remainingTexts)

  if ("root" in node) visitLexicalNode(node.root, remainingTexts)
}
