import type { Payload } from "payload"

import { hasAdminRole } from "@/core/lib/access/has-admin-role"
import { hasServiceAdminRole } from "@/core/lib/access/has-service-admin-role"
import { deliverContactNotification } from "@/core/lib/email/deliver-contact-notification"

type Props = {
  payload: Payload
  user: unknown
  submissionId: number | string | undefined
}

export type ResendNotificationResponse = {
  status: number
  body: {
    message: string
    notificationStatus?: "alreadySent" | "failed" | "sent" | "skipped"
  }
}

/**
 * 管理画面「通知を再送」の本体。エンドポイントから HTTP 依存なしで呼べるよう、
 * 権限判定と結果メッセージの組み立てだけを担う純ハンドラにしている。
 *
 * 再送できるのは admin と serviceAdmin のみ。実際の送信と配信状態の更新は
 * deliverContactNotification に任せ、すでに送信済みなら再送しない。
 */
export async function handleResendNotification(props: Props): Promise<ResendNotificationResponse> {
  if (!props.user) {
    return { status: 401, body: { message: "ログインが必要です" } }
  }

  if (!hasAdminRole(props.user) && !hasServiceAdminRole(props.user)) {
    return { status: 403, body: { message: "通知の再送には管理者権限が必要です" } }
  }

  if (props.submissionId === undefined) {
    return { status: 400, body: { message: "問い合わせの指定がありません" } }
  }

  const result = await deliverContactNotification({
    payload: props.payload,
    submissionId: props.submissionId,
  })

  if (result instanceof Error) {
    return { status: 404, body: { message: result.message } }
  }

  if (result.status === "sent") {
    return {
      status: 200,
      body: { message: "通知メールを送信しました", notificationStatus: "sent" },
    }
  }

  if (result.status === "alreadySent") {
    return {
      status: 200,
      body: { message: "この問い合わせは送信済みです", notificationStatus: "alreadySent" },
    }
  }

  if (result.status === "skipped") {
    return {
      status: 200,
      body: {
        message: `メール送信の設定が未完了のため送信していません (${result.reason})`,
        notificationStatus: "skipped",
      },
    }
  }

  return {
    status: 200,
    body: { message: `送信に失敗しました (${result.error})`, notificationStatus: "failed" },
  }
}
