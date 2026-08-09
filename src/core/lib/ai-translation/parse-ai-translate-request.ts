export type AiTranslateRequest = {
  targetKind: "collection" | "global"
  targetSlug: string
  targetId: string | null
  targetLocale: string
  overwrite: boolean
}

/**
 * 翻訳エンドポイントの入力検証。対象ドキュメントの参照と翻訳先言語だけを受け付け、
 * プロンプト・モデル名・フィールド指定・任意の文章などの自由入力は一切受け付けない
 * （チャット用途への流用防止）。余計なキーは黙って捨てる。
 */
export function parseAiTranslateRequest(body: unknown): AiTranslateRequest | Error {
  if (!body || typeof body !== "object") return new Error("リクエスト形式が不正です")

  const targetKind = "targetKind" in body ? body.targetKind : null

  if (targetKind !== "collection" && targetKind !== "global") {
    return new Error("targetKind が不正です")
  }

  const targetSlug = "targetSlug" in body ? body.targetSlug : null

  if (typeof targetSlug !== "string" || !/^[a-z0-9-]+$/.test(targetSlug)) {
    return new Error("targetSlug が不正です")
  }

  const targetId =
    "targetId" in body && typeof body.targetId === "string" && body.targetId !== ""
      ? body.targetId
      : null

  if (targetKind === "collection" && targetId === null) {
    return new Error("targetId が必要です")
  }

  const targetLocale = "targetLocale" in body ? body.targetLocale : null

  if (typeof targetLocale !== "string" || !/^[a-z]{2}(-[a-z0-9]{2,8})?$/i.test(targetLocale)) {
    return new Error("targetLocale が不正です")
  }

  const overwrite = "overwrite" in body ? body.overwrite === true : false

  return { targetKind, targetSlug, targetId, targetLocale, overwrite }
}
