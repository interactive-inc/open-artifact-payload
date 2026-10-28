import { AnalyticsError } from "@/core/lib/analytics/analytics-error"
import { classifyGa4Status } from "@/core/lib/analytics/classify-ga4-status"
import type { Fetcher } from "@/core/lib/analytics/fetcher"
import {
  ga4BatchResponseSchema,
  type Ga4BatchResponse,
} from "@/core/lib/analytics/ga4-batch-response-schema"

type Props = {
  propertyId: string
  accessToken: string
  body: object
  fetcher: Fetcher
}

/**
 * GA4 Data API の batchRunReports を呼ぶ。10秒で打ち切る。
 * 応答本文にはプロパティの情報が含まれうるため、失敗時もエラーへ載せない。
 */
export async function fetchGa4BatchReports(
  props: Props,
): Promise<Ga4BatchResponse | AnalyticsError> {
  const url = `https://analyticsdata.googleapis.com/v1beta/properties/${props.propertyId}:batchRunReports`

  // Workers の fetch は this 付きで呼ぶと Illegal invocation になるため、取り出してから呼ぶ
  const fetcher = props.fetcher

  try {
    const response = await fetcher(url, {
      method: "POST",
      headers: { authorization: `Bearer ${props.accessToken}`, "content-type": "application/json" },
      body: JSON.stringify(props.body),
      signal: AbortSignal.timeout(10000),
    })

    if (!response.ok) {
      return new AnalyticsError({
        kind: classifyGa4Status(response.status),
        detail: `GA4 ${response.status}`,
      })
    }

    const parsed = ga4BatchResponseSchema.safeParse(await response.json().catch(() => null))

    if (parsed.success) return parsed.data

    return new AnalyticsError({ kind: "invalid-response", detail: "unexpected GA4 response shape" })
  } catch (error) {
    const name = error instanceof Error ? error.name : "unknown"

    return new AnalyticsError({ kind: "unavailable", detail: `GA4 request failed (${name})` })
  }
}
