import type { CollectionConfig } from "payload"

import { hasAiTranslatableField } from "@/core/lib/ai-translation/has-ai-translatable-field"

const aiTranslateControlsPath =
  "@/core/admin/ai-translation/ai-translate-controls#AiTranslateControls"

/**
 * localized なテキストを持つコレクションの編集画面へ AI翻訳ボタンを一括注入する。
 * 新しいコレクションを追加しても、localized フィールドがあれば自動で対象になる
 * （個別のボタン実装は不要）。
 */
export function injectAiTranslateControls(collection: CollectionConfig): CollectionConfig {
  if (!hasAiTranslatableField(collection.fields)) return collection

  const admin = collection.admin ?? {}
  const components = admin.components ?? {}
  const edit = components.edit ?? {}

  return {
    ...collection,
    admin: {
      ...admin,
      components: {
        ...components,
        edit: {
          ...edit,
          beforeDocumentControls: [...(edit.beforeDocumentControls ?? []), aiTranslateControlsPath],
        },
      },
    },
  }
}
