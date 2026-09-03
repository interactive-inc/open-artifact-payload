import type { Endpoint } from "payload"

import { handleResendNotification } from "@/core/lib/email/handle-resend-notification"

/**
 * POST /api/contact-submissions/:id/resend-notification
 * 管理画面の「通知を再送」ボタンから呼ぶ。判定と送信は handleResendNotification 側にあり、
 * ここは routeParams の取り出しと HTTP レスポンス化だけを行う。
 */
export const resendContactNotificationEndpoint: Endpoint = {
  path: "/:id/resend-notification",
  method: "post",
  handler: async (req) => {
    const routeId = req.routeParams?.id
    const submissionId =
      typeof routeId === "string" || typeof routeId === "number" ? routeId : undefined

    const response = await handleResendNotification({
      payload: req.payload,
      user: req.user,
      submissionId,
    })

    return Response.json(response.body, { status: response.status })
  },
}
