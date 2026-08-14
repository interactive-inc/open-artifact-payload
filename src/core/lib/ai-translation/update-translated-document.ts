import type { Payload, TypedLocale } from "payload"

import { isCollectionSlug } from "@/core/lib/ai-translation/is-collection-slug"
import { isGlobalSlug } from "@/core/lib/ai-translation/is-global-slug"
import type { User } from "@/payload-types"

type Props = {
  payload: Payload
  user: User
  targetKind: "collection" | "global"
  targetSlug: string
  targetId: string | null
  targetLocale: TypedLocale
  updateData: Record<string, unknown>
  hasDrafts: boolean
}

/**
 * 翻訳結果を翻訳先 locale に保存する。versions.drafts のあるエンティティは
 * draft として保存し、自動公開しない（編集者の確認後に公開する運用）。
 * overrideAccess: false + user で Payload のアクセス制御に乗せる。
 */
export async function updateTranslatedDocument(props: Props): Promise<null | Error> {
  try {
    if (props.targetKind === "collection") {
      if (!isCollectionSlug(props.payload, props.targetSlug) || props.targetId === null) {
        return new Error("翻訳対象が見つかりません")
      }

      // 動的 slug 経由の Local API は生成型の厳密な data 型に静的には合わせられない。
      // 外部ライブラリ型との接続として、このファイル内のみ assertion を許容する（ts.md の適用除外）。
      await props.payload.update({
        collection: props.targetSlug,
        id: props.targetId,
        data: props.updateData as never,
        locale: props.targetLocale,
        draft: props.hasDrafts,
        depth: 0,
        overrideAccess: false,
        user: props.user,
      })

      return null
    }

    if (!isGlobalSlug(props.payload, props.targetSlug)) {
      return new Error("翻訳対象が見つかりません")
    }

    await props.payload.updateGlobal({
      slug: props.targetSlug,
      data: props.updateData as never,
      locale: props.targetLocale,
      draft: props.hasDrafts,
      depth: 0,
      overrideAccess: false,
      user: props.user,
    })

    return null
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)

    return new Error(`翻訳結果の保存に失敗しました: ${message}`)
  }
}
