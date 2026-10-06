/** 記号付きリストの入力を、1行1項目の配列にする。前後の空白を除き、空の行は捨てる。 */
export function splitListItems(text: string | null): string[] {
  if (!text) return []

  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line !== "")
}
