import { z } from "zod"

const ga4ValueSchema = z.object({ value: z.string().default("") })

const ga4HeaderSchema = z.object({ name: z.string() })

const ga4ReportSchema = z.object({
  dimensionHeaders: z.array(ga4HeaderSchema).default([]),
  metricHeaders: z.array(ga4HeaderSchema).default([]),
  rows: z
    .array(
      z.object({
        dimensionValues: z.array(ga4ValueSchema).default([]),
        metricValues: z.array(ga4ValueSchema).default([]),
      }),
    )
    .default([]),
})

/**
 * GA4 Data API batchRunReports の応答のうち、表示に使う部分。
 * 送る集計は推移・合計・人気ページ・流入元の4種類で、応答も同じ順に4つ返る。
 */
export const ga4BatchResponseSchema = z.object({
  reports: z.tuple([ga4ReportSchema, ga4ReportSchema, ga4ReportSchema, ga4ReportSchema]),
})

export type Ga4BatchResponse = z.infer<typeof ga4BatchResponseSchema>

export type Ga4Report = z.infer<typeof ga4ReportSchema>
