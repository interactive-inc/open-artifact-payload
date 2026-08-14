"use client"

import { Button, toast, useDocumentInfo, useFormModified } from "@payloadcms/ui"
import { useState } from "react"

type TargetLocale = {
  code: string
  label: string
}

type Props = {
  targetLocales: TargetLocale[]
  apiRoute: string
}

/**
 * AI翻訳の実行ボタン。保存済みの原文（デフォルト言語）を全対象言語へ順次翻訳する。
 * 通常は未入力フィールドのみ。「再翻訳（上書き）」は確認ダイアログを挟む。
 * 実行中はボタンを無効化して連打による多重実行を防ぐ。
 * 未保存の変更がある間は無効化し（保存前の内容は翻訳されないため）、
 * 成功後はページを再読み込みして画面のフォームに翻訳結果を反映する
 * （古いフォーム状態のまま「保存」して翻訳を上書きしてしまう事故を防ぐ）。
 */
export function AiTranslateButton(props: Props) {
  const documentInfo = useDocumentInfo()
  const isFormModified = useFormModified()
  const [isRunning, setIsRunning] = useState(false)

  const collectionSlug = documentInfo.collectionSlug ?? null
  const globalSlug = documentInfo.globalSlug ?? null
  const documentId = documentInfo.id ?? null

  // 新規作成画面では原文が未保存のため翻訳できない
  if (collectionSlug && documentId === null) return null

  if (!collectionSlug && !globalSlug) return null

  const runTranslation = async (overwrite: boolean) => {
    if (overwrite && !window.confirm("既存の翻訳文も上書きして再翻訳します。よろしいですか？")) {
      return
    }

    setIsRunning(true)

    try {
      const outcomes: boolean[] = []

      for (const locale of props.targetLocales) {
        const response = await fetch(`${props.apiRoute}/ai-translate`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            targetKind: globalSlug ? "global" : "collection",
            targetSlug: globalSlug ?? collectionSlug,
            targetId: documentId === null ? null : String(documentId),
            targetLocale: locale.code,
            overwrite,
          }),
        })

        const responseBody: unknown = await response.json()
        const message =
          responseBody &&
          typeof responseBody === "object" &&
          "message" in responseBody &&
          typeof responseBody.message === "string"
            ? responseBody.message
            : null

        outcomes.push(response.ok)

        if (response.ok) {
          toast.success(`${locale.label}: ${message ?? "翻訳しました"}`)
        } else {
          toast.error(`${locale.label}: ${message ?? "翻訳に失敗しました"}`)
        }
      }

      if (outcomes.some((isSucceeded) => isSucceeded)) {
        // トーストを読める程度の間を置いてから、翻訳結果をフォームへ反映するために再読み込み
        setTimeout(() => window.location.reload(), 1500)
        return
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "翻訳に失敗しました")
    } finally {
      setIsRunning(false)
    }
  }

  const isDisabled = isRunning || isFormModified

  return (
    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
      <Button
        size="medium"
        buttonStyle="secondary"
        disabled={isDisabled}
        onClick={() => void runTranslation(false)}
        tooltip={
          isFormModified
            ? "未保存の変更があります。先に保存してください"
            : "保存済みの原文を翻訳し、未入力の言語フィールドにだけ書き込みます"
        }
      >
        {isRunning ? "AI翻訳中…" : "AI翻訳（未入力のみ）"}
      </Button>
      <Button
        size="medium"
        buttonStyle="pill"
        disabled={isDisabled}
        onClick={() => void runTranslation(true)}
        tooltip={
          isFormModified
            ? "未保存の変更があります。先に保存してください"
            : "既存の翻訳文も含めて上書きします（確認あり）"
        }
      >
        再翻訳（上書き）
      </Button>
    </div>
  )
}
