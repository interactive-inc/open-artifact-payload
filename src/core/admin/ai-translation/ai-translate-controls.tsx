import type { ServerProps } from "payload"

import { AiTranslateButton } from "@/core/admin/ai-translation/ai-translate-button"

/**
 * AI翻訳ボタンのサーバー側ラッパー。AI翻訳設定が無効のときは何も描画しない
 * （管理画面のオフ操作が即座に UI へ反映される）。
 */
export async function AiTranslateControls(props: ServerProps) {
  const settings = await props.payload.findGlobal({ slug: "ai-translation-settings", depth: 0 })

  if (settings.enabled !== true) return null

  const localization = props.payload.config.localization

  if (!localization) return null

  const targetLocales = localization.locales
    .filter((locale) => locale.code !== localization.defaultLocale)
    .map((locale) => ({
      code: locale.code,
      label: typeof locale.label === "string" ? locale.label : locale.code,
    }))

  if (targetLocales.length === 0) return null

  return (
    <AiTranslateButton targetLocales={targetLocales} apiRoute={props.payload.config.routes.api} />
  )
}
