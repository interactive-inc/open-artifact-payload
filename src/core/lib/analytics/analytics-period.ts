export type DateSpan = {
  startDate: string
  endDate: string
}

export type AnalyticsPeriod = {
  days: number
  current: DateSpan
  previous: DateSpan
}
