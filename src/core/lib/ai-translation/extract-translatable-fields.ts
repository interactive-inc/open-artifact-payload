import type { Field } from "payload"

import { collectLexicalTexts } from "@/core/lib/ai-translation/collect-lexical-texts"
import { isAiTranslateDisabled } from "@/core/lib/ai-translation/is-ai-translate-disabled"
import type { TranslatableField } from "@/core/lib/ai-translation/translation-types"

type Props = {
  fields: ReadonlyArray<Field>
  sourceData: unknown
  basePath?: ReadonlyArray<string | number>
}

/**
 * フィールド定義とドキュメントを突き合わせ、AI翻訳対象を再帰的に抽出する共通ルール。
 * 対象: `localized: true` の text / textarea / richText（`custom: { aiTranslate: false }` を除く）。
 * URL・ID・select 値・数値・リレーションなどテキスト以外は対象にしない。
 * group / array / blocks / tabs / row / collapsible は走査するが、コンテナ自体が
 * `localized: true` の場合はロケール間で行構造が一致しないためスキップする
 * （テンプレートの規約どおりフィールド単位の localized を使うこと）。
 */
export function extractTranslatableFields(props: Props): TranslatableField[] {
  const basePath = props.basePath ?? []
  const collected: TranslatableField[] = []
  const source = props.sourceData

  if (!source || typeof source !== "object") return collected

  for (const field of props.fields) {
    if (isAiTranslateDisabled(field)) continue

    if (field.type === "row" || field.type === "collapsible") {
      collected.push(
        ...extractTranslatableFields({ fields: field.fields, sourceData: source, basePath }),
      )
      continue
    }

    if (field.type === "tabs") {
      for (const tab of field.tabs) {
        if (isAiTranslateDisabled(tab)) continue
        if ("name" in tab && typeof tab.name === "string") {
          collected.push(
            ...extractTranslatableFields({
              fields: tab.fields,
              sourceData: Reflect.get(source, tab.name),
              basePath: [...basePath, tab.name],
            }),
          )
          continue
        }
        collected.push(
          ...extractTranslatableFields({ fields: tab.fields, sourceData: source, basePath }),
        )
      }
      continue
    }

    if (field.type === "group") {
      if (field.localized === true) continue
      if (!("name" in field) || typeof field.name !== "string") {
        collected.push(
          ...extractTranslatableFields({ fields: field.fields, sourceData: source, basePath }),
        )
        continue
      }
      collected.push(
        ...extractTranslatableFields({
          fields: field.fields,
          sourceData: Reflect.get(source, field.name),
          basePath: [...basePath, field.name],
        }),
      )
      continue
    }

    if (field.type === "array") {
      if (field.localized === true) continue
      const rows = Reflect.get(source, field.name)
      if (!Array.isArray(rows)) continue
      for (const rowIndex of rows.keys()) {
        collected.push(
          ...extractTranslatableFields({
            fields: field.fields,
            sourceData: rows[rowIndex],
            basePath: [...basePath, field.name, rowIndex],
          }),
        )
      }
      continue
    }

    if (field.type === "blocks") {
      if (field.localized === true) continue
      const rows = Reflect.get(source, field.name)
      if (!Array.isArray(rows)) continue
      for (const rowIndex of rows.keys()) {
        const row: unknown = rows[rowIndex]
        if (!row || typeof row !== "object") continue
        const blockType = "blockType" in row ? row.blockType : null
        const block = (field.blocks ?? []).find((candidate) => candidate.slug === blockType)
        if (!block) continue
        collected.push(
          ...extractTranslatableFields({
            fields: block.fields,
            sourceData: row,
            basePath: [...basePath, field.name, rowIndex],
          }),
        )
      }
      continue
    }

    if (field.type === "text" || field.type === "textarea") {
      if (field.localized !== true) continue
      const value = Reflect.get(source, field.name)
      if (typeof value !== "string" || value.trim() === "") continue
      collected.push({ path: [...basePath, field.name], kind: "plain", texts: [value] })
      continue
    }

    if (field.type === "richText") {
      if (field.localized !== true) continue
      const texts = collectLexicalTexts(Reflect.get(source, field.name))
      if (texts.every((text) => text.trim() === "")) continue
      collected.push({ path: [...basePath, field.name], kind: "lexical", texts })
    }
  }

  return collected
}
