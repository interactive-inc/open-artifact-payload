"use client"

import { Button, toast, useAuth, useConfig, useDocumentInfo, useFormModified } from "@payloadcms/ui"
import { useState } from "react"

import { hasAdminRole } from "@/core/lib/access/has-admin-role"
import { hasServiceAdminRole } from "@/core/lib/access/has-service-admin-role"

/**
 * 問い合わせの通知メールを再送するボタン。
 * 再送できるのは admin とサービス管理者だけなので、それ以外には表示しない。
 * 送信済みのレコードはサーバー側で二重送信を防ぐため、押しても再送されない。
 * 実行中は無効化し、成功後は配信状態のフィールドを更新するためにページを再読み込みする。
 */
export function ResendNotificationButton() {
  const documentInfo = useDocumentInfo()
  const isFormModified = useFormModified()
  const configState = useConfig()
  const authState = useAuth()
  const [isRunning, setIsRunning] = useState(false)

  const documentId = documentInfo.id ?? null

  if (documentInfo.collectionSlug !== "contact-submissions") return null

  // 新規作成画面にはまだレコードが無い
  if (documentId === null) return null

  if (!hasAdminRole(authState.user) && !hasServiceAdminRole(authState.user)) return null

  const resendNotification = async () => {
    setIsRunning(true)

    try {
      const response = await fetch(
        `${configState.config.routes.api}/contact-submissions/${String(documentId)}/resend-notification`,
        { method: "POST", credentials: "include" },
      )

      const responseBody: unknown = await response.json()
      const message =
        responseBody &&
        typeof responseBody === "object" &&
        "message" in responseBody &&
        typeof responseBody.message === "string"
          ? responseBody.message
          : null
      const notificationStatus =
        responseBody && typeof responseBody === "object" && "notificationStatus" in responseBody
          ? responseBody.notificationStatus
          : null

      if (response.ok && notificationStatus === "sent") {
        toast.success(message ?? "通知メールを送信しました")
        // トーストを読める程度の間を置いてから、配信状態を画面へ反映するために再読み込み
        setTimeout(() => window.location.reload(), 1500)
        return
      }

      // 送信済みは失敗ではないため、エラーとしては見せない
      if (response.ok && notificationStatus === "alreadySent") {
        toast.info(message ?? "この問い合わせは送信済みです")
        return
      }

      toast.error(message ?? "通知の再送に失敗しました")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "通知の再送に失敗しました")
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <Button
      size="medium"
      buttonStyle="secondary"
      disabled={isRunning || isFormModified}
      onClick={() => void resendNotification()}
      tooltip={
        isFormModified
          ? "未保存の変更があります。先に保存してください"
          : "管理者への通知メールをもう一度送信します（送信済みの場合は送りません）"
      }
    >
      {isRunning ? "再送中…" : "通知を再送"}
    </Button>
  )
}
