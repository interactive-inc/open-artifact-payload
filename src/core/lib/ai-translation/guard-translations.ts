type Props = {
  sourceUnits: ReadonlyArray<string>
  translations: ReadonlyArray<string>
}

/**
 * AI の翻訳結果に対する最終ガード。件数一致・空白のみ原文の温存・異常な長さの拒否。
 * 想定外の出力は保存させない（プロンプトインジェクション対策の一部）。
 */
export function guardTranslations(props: Props): string[] | Error {
  if (props.translations.length !== props.sourceUnits.length) {
    return new Error('翻訳結果の件数が翻訳対象と一致しません')
  }

  const guardedTranslations: string[] = []

  for (const index of props.sourceUnits.keys()) {
    const sourceUnit = props.sourceUnits[index] ?? ''
    const translated = props.translations[index] ?? ''

    if (sourceUnit.trim() === '') {
      guardedTranslations.push(sourceUnit)
      continue
    }

    if (translated.length > sourceUnit.length * 10 + 200) {
      return new Error('翻訳結果が原文に対して長すぎるため保存を中止しました')
    }

    guardedTranslations.push(translated)
  }

  return guardedTranslations
}
