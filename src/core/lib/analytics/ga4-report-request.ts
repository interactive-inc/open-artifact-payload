type Ga4DateRange = {
  name: string
  startDate: string
  endDate: string
}

type Ga4OrderBy = {
  metric: { metricName: string }
  desc: boolean
}

/** GA4 Data API の RunReportRequest のうち、このテンプレートが使う項目。 */
export type Ga4ReportRequest = {
  dateRanges: Ga4DateRange[]
  dimensions: Array<{ name: string }>
  metrics: Array<{ name: string }>
  orderBys: Ga4OrderBy[]
  limit: string
}
