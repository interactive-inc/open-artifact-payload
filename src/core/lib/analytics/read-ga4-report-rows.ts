import type { Ga4Report } from "@/core/lib/analytics/ga4-batch-response-schema"

/** GA4 の行を、次元名・指標名をキーにした値の対応へ直す。列の順番に依存しないため。 */
export function readGa4ReportRows(report: Ga4Report): Array<Record<string, string>> {
  const names = [...report.dimensionHeaders, ...report.metricHeaders].map((header) => header.name)

  return report.rows.map((row) => {
    const values = [...row.dimensionValues, ...row.metricValues]

    return Object.fromEntries(names.map((name, index) => [name, values[index]?.value ?? ""]))
  })
}
