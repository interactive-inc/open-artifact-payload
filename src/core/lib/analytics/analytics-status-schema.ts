import { z } from "zod"

import { ANALYTICS_ERROR_KINDS } from "@/core/lib/analytics/analytics-error-kind"

/** 最後に GA4 から取得できた日時と、直近の失敗。設定画面の接続状態に出す。 */
export const analyticsStatusSchema = z.object({
  lastSuccessAt: z.iso.datetime().nullable(),
  lastFailureAt: z.iso.datetime().nullable(),
  lastFailureKind: z.enum(ANALYTICS_ERROR_KINDS).nullable(),
})

export type AnalyticsStatus = z.infer<typeof analyticsStatusSchema>

export const EMPTY_ANALYTICS_STATUS: AnalyticsStatus = {
  lastSuccessAt: null,
  lastFailureAt: null,
  lastFailureKind: null,
}
