import type { Payload } from "payload"

import { sanitizeErrorMessage } from "@/core/lib/email/sanitize-error-message"
import { sendContactNotification } from "@/core/lib/email/send-contact-notification"

type Props = {
  payload: Payload
  submissionId: number | string
}

export type ContactNotificationDelivery =
  | { status: "sent" }
  | { status: "alreadySent" }
  | { status: "skipped"; reason: string }
  | { status: "failed"; error: string }

/**
 * 問い合わせ 1 件の通知メールを送信し、結果をレコードの配信状態へ書き戻す。
 *
 * フォームからの初回送信も管理画面からの再送もこの関数を通す。すでに sent のレコードは
 * 送信せず alreadySent を返すため、再送ボタンの連打や再試行で二重送信にならない。
 * 配信状態の更新に失敗しても例外は投げず、送信自体の結果をそのまま返す
 * (フォームの成功応答や再送レスポンスをブロックしないため)。
 */
export async function deliverContactNotification(
  props: Props,
): Promise<ContactNotificationDelivery | Error> {
  const submission = await props.payload
    .findByID({ collection: "contact-submissions", id: props.submissionId, depth: 0 })
    .catch(() => null)

  if (!submission) return new Error("対象の問い合わせが見つかりません")

  if (submission.notificationStatus === "sent") return { status: "alreadySent" }

  const result = await sendContactNotification({
    payload: props.payload,
    submission: {
      name: submission.name,
      email: submission.email,
      phone: submission.phone ?? null,
      companyName: submission.companyName ?? null,
      inquiryType: submission.inquiryType ?? null,
      message: submission.message,
    },
  })

  const reason = result.status === "failed" ? result.error : null
  const skipReason = result.status === "skipped" ? result.reason : null

  await props.payload
    .update({
      collection: "contact-submissions",
      id: props.submissionId,
      data: {
        notificationStatus: result.status,
        notificationError: reason ?? skipReason,
        notifiedAt: result.status === "sent" ? new Date().toISOString() : null,
      },
    })
    .catch((error: unknown) => {
      console.error("[contact] 通知状態の更新に失敗しました:", sanitizeErrorMessage(error))
    })

  return result
}
