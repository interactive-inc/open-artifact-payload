import { Resend } from "resend"

type ContactPayload = {
  name: string
  email: string
  phone?: string
  companyName?: string
  inquiryType?: string
  message: string
}

type NotificationResult =
  | { status: "sent" }
  | { status: "skipped"; reason: string }
  | { status: "failed"; error: string }

/**
 * 問い合わせ受付の管理者通知メールを Resend 経由で送信する。
 *
 * RESEND_API_KEY / CONTACT_NOTIFICATION_EMAIL / CONTACT_NOTIFICATION_FROM のいずれかが未設定
 * のときは送信せず skipped で返す。送信失敗時も例外を投げず failed で返す（フォーム本体の保存は維持）。
 */
export async function sendContactNotification(
  payload: ContactPayload,
): Promise<NotificationResult> {
  const apiKey = process.env.RESEND_API_KEY
  const to = process.env.CONTACT_NOTIFICATION_EMAIL
  const from = process.env.CONTACT_NOTIFICATION_FROM
  if (!apiKey) return { status: "skipped", reason: "RESEND_API_KEY 未設定" }
  if (!to) return { status: "skipped", reason: "CONTACT_NOTIFICATION_EMAIL 未設定" }
  if (!from) return { status: "skipped", reason: "CONTACT_NOTIFICATION_FROM 未設定" }

  const resend = new Resend(apiKey)
  const lines: string[] = [
    `お名前: ${payload.name}`,
    payload.companyName ? `会社名: ${payload.companyName}` : null,
    `メール: ${payload.email}`,
    payload.phone ? `電話: ${payload.phone}` : null,
    payload.inquiryType ? `種別: ${payload.inquiryType}` : null,
    "",
    "----- 本文 -----",
    payload.message,
  ].filter((line): line is string => line !== null)

  try {
    await resend.emails.send({
      from,
      to,
      replyTo: payload.email,
      subject: `【お問い合わせ】${payload.name} 様より`,
      text: lines.join("\n"),
    })
    return { status: "sent" }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return { status: "failed", error: message }
  }
}
