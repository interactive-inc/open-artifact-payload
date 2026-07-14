import type { GlobalConfig } from 'payload'

import { hasAiTranslatableField } from '@/core/lib/ai-translation/has-ai-translatable-field'

const aiTranslateControlsPath =
  '@/core/admin/ai-translation/ai-translate-controls#AiTranslateControls'

/**
 * localized なテキストを持つグローバルの編集画面へ AI翻訳ボタンを一括注入する。
 * グローバルは admin.components.elements 配下に置く仕様（コレクションは edit 配下）。
 */
export function injectAiTranslateControlsIntoGlobal(globalConfig: GlobalConfig): GlobalConfig {
  if (!hasAiTranslatableField(globalConfig.fields)) return globalConfig

  const admin = globalConfig.admin ?? {}
  const components = admin.components ?? {}
  const elements = components.elements ?? {}

  return {
    ...globalConfig,
    admin: {
      ...admin,
      components: {
        ...components,
        elements: {
          ...elements,
          beforeDocumentControls: [
            ...(elements.beforeDocumentControls ?? []),
            aiTranslateControlsPath,
          ],
        },
      },
    },
  }
}
