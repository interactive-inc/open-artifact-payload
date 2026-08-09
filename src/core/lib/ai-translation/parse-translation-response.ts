type Props = {
  rawText: string
  expectedCount: number
}

/**
 * AI 応答の検証付きパース。`{"translations": string[]}` の形式・件数・型が
 * 想定どおりでない出力（チャット応答など）は Error にして保存させない。
 */
export function parseTranslationResponse(props: Props): string[] | Error {
  const stripped = props.rawText
    .trim()
    .replace(/^```(?:json)?\s*/, "")
    .replace(/\s*```$/, "")

  try {
    const parsed: unknown = JSON.parse(stripped)

    if (!parsed || typeof parsed !== "object" || !("translations" in parsed)) {
      return new Error("翻訳結果の形式が不正です（translations がありません）")
    }

    const translations = parsed.translations

    if (!Array.isArray(translations) || translations.length !== props.expectedCount) {
      return new Error("翻訳結果の件数が翻訳対象と一致しません")
    }

    if (!translations.every((item): item is string => typeof item === "string")) {
      return new Error("翻訳結果に文字列以外が含まれています")
    }

    return translations
  } catch {
    return new Error("翻訳結果を JSON として読み取れませんでした")
  }
}
