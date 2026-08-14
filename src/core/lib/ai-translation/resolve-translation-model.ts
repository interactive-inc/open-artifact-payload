import {
  translationModels,
  type TranslationModel,
} from "@/core/lib/ai-translation/translation-models"

/**
 * 管理画面で選択されたモデル値をレジストリと照合する。
 * 未登録の値（自由入力や改ざん）は Error にして API 呼び出しをさせない。
 */
export function resolveTranslationModel(
  value: string | null | undefined,
): TranslationModel | Error {
  const found = translationModels.find((model) => model.value === value)

  if (!found) return new Error(`未対応の翻訳モデルです: ${String(value)}`)

  return found
}
