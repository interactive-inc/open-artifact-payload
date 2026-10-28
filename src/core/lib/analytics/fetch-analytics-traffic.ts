import type { AnalyticsRange } from "@/core/lib/analytics/analytics-range"
import type { AnalyticsTraffic } from "@/core/lib/analytics/analytics-traffic-schema"
import type { AnalyticsError } from "@/core/lib/analytics/analytics-error"
import { buildGa4BatchRequest } from "@/core/lib/analytics/build-ga4-batch-request"
import { fetchGa4BatchReports } from "@/core/lib/analytics/fetch-ga4-batch-reports"
import type { Fetcher } from "@/core/lib/analytics/fetcher"
import { getAnalyticsPeriod } from "@/core/lib/analytics/get-analytics-period"
import { readGa4ServiceAccount } from "@/core/lib/analytics/read-ga4-service-account"
import { requestGoogleAccessToken } from "@/core/lib/analytics/request-google-access-token"
import { toAnalyticsTraffic } from "@/core/lib/analytics/to-analytics-traffic"

type Props = {
  range: AnalyticsRange
  propertyId: string
  serviceAccountJson: string | undefined
  now: Date
  fetcher: Fetcher
}

/** 鍵の読み込みからトークン取得、GA4 への問い合わせ、画面用の変換までを順に行う。 */
export async function fetchAnalyticsTraffic(
  props: Props,
): Promise<AnalyticsTraffic | AnalyticsError> {
  const account = readGa4ServiceAccount(props.serviceAccountJson)

  if (account instanceof Error) return account

  const accessToken = await requestGoogleAccessToken({
    account,
    now: props.now,
    fetcher: props.fetcher,
  })

  if (accessToken instanceof Error) return accessToken

  const period = getAnalyticsPeriod({ range: props.range, now: props.now })

  const response = await fetchGa4BatchReports({
    propertyId: props.propertyId,
    accessToken,
    body: buildGa4BatchRequest(period),
    fetcher: props.fetcher,
  })

  if (response instanceof Error) return response

  return toAnalyticsTraffic({ range: props.range, period, response, fetchedAt: props.now })
}
