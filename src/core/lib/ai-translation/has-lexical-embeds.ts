const embedTypes: readonly string[] = ["block", "inlineBlock", "upload", "relationship"]

/**
 * Lexical のリッチテキスト JSON に、文字以外の内容 (ブロック・画像・関連) が含まれるかを調べる。
 * これらは text ノードを持たないため、文字だけで未入力と判定すると手入力の内容を上書きしてしまう。
 */
export function hasLexicalEmbeds(value: unknown): boolean {
  if (!value || typeof value !== "object") return false

  if (Array.isArray(value)) return value.some(hasLexicalEmbeds)

  if ("type" in value && typeof value.type === "string" && embedTypes.includes(value.type)) {
    return true
  }

  if ("children" in value && hasLexicalEmbeds(value.children)) return true

  return "root" in value && hasLexicalEmbeds(value.root)
}
