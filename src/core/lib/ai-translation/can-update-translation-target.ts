import type { Payload, PayloadRequest } from "payload"

import type { User } from "@/payload-types"

type Props = {
  payload: Payload
  user: User
  targetKind: "collection" | "global"
  targetSlug: string
}

/**
 * AI API を呼ぶ前の update 権限の事前チェック。閲覧はできるが更新できないユーザーが
 * 翻訳を実行して API 費用だけ発生させることを防ぐ（例: site-settings は read 公開・update admin 限定）。
 * access が Where（ドキュメント条件）を返す場合はここでは判定できないため保存時の本判定に委ねる。
 */
export async function canUpdateTranslationTarget(props: Props): Promise<boolean> {
  const entityConfig =
    props.targetKind === "collection"
      ? props.payload.config.collections.find((candidate) => candidate.slug === props.targetSlug)
      : props.payload.config.globals.find((candidate) => candidate.slug === props.targetSlug)

  const updateAccess = entityConfig?.access?.update

  if (!updateAccess) return true

  // このテンプレートの access 関数は req.user しか参照しない。完全な PayloadRequest を
  // 組み立てるのは非現実的なため、外部ライブラリ型との接続としてここだけ assertion を許容する
  // （ts.md の適用除外）。
  const partialRequest = { user: props.user, payload: props.payload } as unknown as PayloadRequest

  try {
    const accessResult = await updateAccess({ req: partialRequest })

    return accessResult !== false
  } catch {
    // 事前チェックで評価できない access は保存時の本判定に委ねる
    return true
  }
}
