import { getValueAtPath } from "@/core/lib/ai-translation/get-value-at-path"
import { isEmptyTranslationValue } from "@/core/lib/ai-translation/is-empty-translation-value"
import type { TranslatableField } from "@/core/lib/ai-translation/translation-types"

type Props = {
  fields: ReadonlyArray<TranslatableField>
  targetDoc: unknown
}

/**
 * 翻訳先ドキュメント（fallback 無効で取得したもの）で未入力のフィールドだけを残す。
 */
export function filterUntranslatedFields(props: Props): TranslatableField[] {
  return props.fields.filter((field) =>
    isEmptyTranslationValue(getValueAtPath(props.targetDoc, field.path), field.kind),
  )
}
