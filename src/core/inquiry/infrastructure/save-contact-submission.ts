import { getPayload } from "payload"
import config from "@/payload.config"
import { sanitizeErrorMessage } from "@/core/lib/email/sanitize-error-message"
import type { ContactFormFields } from "@/core/inquiry/domain/contact-form-fields"

/** 入力・頻度制限・Turnstileの検証後だけ呼ぶ信頼済みの保存経路。 */
export async function saveContactSubmission(fields: ContactFormFields): Promise<number | null> {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  // D1 タイムアウト / ロック / スキーマ不整合などを拾って
  // UI 側で再試行可能な状態にする (action が reject して UI が固まらないように)。
  const submission = await payload
    .create({
      collection: "contact-submissions",
      // 入力・レート制限・Turnstileを検証済みのServer Action専用経路。
      overrideAccess: true,
      data: {
        name: fields.name,
        email: fields.email,
        phone: fields.phone.length > 0 ? fields.phone : null,
        companyName: fields.companyName.length > 0 ? fields.companyName : null,
        inquiryType: fields.inquiryType.length > 0 ? fields.inquiryType : null,
        message: fields.message,
        status: "new",
        notificationStatus: "pending",
      },
    })
    .catch((error: unknown) => {
      // 保存エラーには送信内容が echo されうるため、伏せ字と長さ制限をかけてから記録する
      console.error(
        "[contact] 問い合わせ保存失敗:",
        sanitizeErrorMessage(error, [
          fields.name,
          fields.email,
          fields.message,
          fields.phone,
          fields.companyName,
        ]),
      )
      return null
    })

  return submission?.id ?? null
}
