import { applyLexicalTexts } from "@/core/lib/ai-translation/apply-lexical-texts"
import { getValueAtPath } from "@/core/lib/ai-translation/get-value-at-path"
import { setValueAtPath } from "@/core/lib/ai-translation/set-value-at-path"
import type { TranslatableField } from "@/core/lib/ai-translation/translation-types"

type Props = {
  baseDoc: unknown
  sourceDoc: unknown
  fields: ReadonlyArray<TranslatableField>
  translatedUnits: ReadonlyArray<string>
}

/**
 * 翻訳先ロケールの現行ドキュメント（baseDoc）の複製へ翻訳文を書き込み、
 * 触った top-level フィールドだけの update 用データを返す。
 * richText は原文（sourceDoc）の Lexical 構造をベースに text だけを差し替える。
 * 途中で不整合があれば Error を返し、部分的な保存はさせない。
 */
export function applyTranslatedFields(props: Props): Record<string, unknown> | Error {
  const expectedCount = props.fields.reduce((sum, field) => sum + field.texts.length, 0)

  if (props.translatedUnits.length !== expectedCount) {
    return new Error("翻訳結果の数が翻訳対象と一致しません")
  }

  const cloned: unknown = structuredClone(props.baseDoc)

  if (!cloned || typeof cloned !== "object" || Array.isArray(cloned)) {
    return new Error("翻訳先ドキュメントの形式が不正です")
  }

  const remainingUnits = [...props.translatedUnits]

  for (const field of props.fields) {
    const units = remainingUnits.splice(0, field.texts.length)
    const pathLabel = field.path.join(".")

    if (field.kind === "plain") {
      const isSet = setValueAtPath(cloned, field.path, units[0] ?? "")
      if (!isSet) return new Error(`フィールドへの書き込みに失敗しました: ${pathLabel}`)
      continue
    }

    const applied = applyLexicalTexts(getValueAtPath(props.sourceDoc, field.path), units)
    if (applied instanceof Error) return applied

    const isSet = setValueAtPath(cloned, field.path, applied)
    if (!isSet) return new Error(`フィールドへの書き込みに失敗しました: ${pathLabel}`)
  }

  const touchedKeys = new Set(props.fields.map((field) => String(field.path[0])))
  const updateData: Record<string, unknown> = {}

  for (const key of touchedKeys) updateData[key] = Reflect.get(cloned, key)

  return updateData
}
