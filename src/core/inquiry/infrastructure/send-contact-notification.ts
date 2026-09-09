import type { Payload } from "payload"

import { sanitizeErrorMessage } from "@/core/lib/email/sanitize-error-message"

type ContactNotificationInput = {
  name: string
  email: string
  phone: string | null
  companyName: string | null
  inquiryType: string | null
  message: string
}

type Props = {
  payload: Payload
  submission: ContactNotificationInput
}

export type ContactNotificationResult =
  | { status: "sent" }
  | { status: "skipped"; reason: string }
  | { status: "failed"; error: string }

/**
 * 問い合わせ受付の管理者通知メールを Payload のメールアダプタ経由で送信する。
 *
 * 送信基盤は認証メールと共通 (resolve-email-adapter)。RESEND_API_KEY か宛先・送信元が
 * 未設定のときは送信せず skipped を返す。送信失敗時も例外を投げず failed を返し、
 * 呼び出し側で配信状態として記録できるようにする。
 */
export async function sendContactNotification(props: Props): Promise<ContactNotificationResult> {
  const apiKey = process.env.RESEND_API_KEY
  const to = process.env.CONTACT_NOTIFICATION_EMAIL
  const from = [process.env.CONTACT_NOTIFICATION_FROM, process.env.EMAIL_FROM].find(
    (value) => typeof value === "string" && value.trim().length > 0,
  )

  if (!apiKey) return { status: "skipped", reason: "RESEND_API_KEY 未設定" }
  if (!to) return { status: "skipped", reason: "CONTACT_NOTIFICATION_EMAIL 未設定" }
  if (!from) return { status: "skipped", reason: "CONTACT_NOTIFICATION_FROM / EMAIL_FROM 未設定" }

  const lines: string[] = [
    `お名前: ${props.submission.name}`,
    props.submission.companyName ? `会社名: ${props.submission.companyName}` : null,
    `メール: ${props.submission.email}`,
    props.submission.phone ? `電話: ${props.submission.phone}` : null,
    props.submission.inquiryType ? `種別: ${props.submission.inquiryType}` : null,
    "",
    "----- 本文 -----",
    props.submission.message,
  ].filter((line): line is string => line !== null)

  try {
    await props.payload.sendEmail({
      from,
      to,
      replyTo: props.submission.email,
      subject: `【お問い合わせ】${props.submission.name} 様より`,
      text: lines.join("\n"),
    })
    return { status: "sent" }
  } catch (error) {
    // Resend のエラー文字列には宛先アドレスや件名の氏名が含まれうるので、
    // 呼び出し元がそのままログへ出せる形に落としてから返す
    return {
      status: "failed",
      error: sanitizeErrorMessage(error, [
        props.submission.name,
        props.submission.email,
        props.submission.message,
      ]),
    }
  }
}
