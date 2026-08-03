import { z } from 'zod'

import { jsonObjectSchema } from '../domain/json-value'

const localeSchema = z.string().trim().min(1).max(20).nullable()
const slugSchema = z.string()
const idSchema = z.string()

export const listCollectionDocumentsInputSchema = z.object({
  slug: slugSchema,
  limit: z.number().int().min(1).max(100),
  page: z.number().int().min(1),
  locale: localeSchema,
  draft: z.boolean(),
  depth: z.number().int().min(0).max(10),
})

export const findCollectionDocumentInputSchema = z.object({
  slug: slugSchema,
  id: idSchema,
})

export const createCollectionDocumentInputSchema = z.object({
  slug: slugSchema,
  data: jsonObjectSchema,
})

export const updateCollectionDocumentInputSchema = z.object({
  slug: slugSchema,
  id: idSchema,
  data: jsonObjectSchema,
})

export const deleteCollectionDocumentInputSchema = findCollectionDocumentInputSchema

export const findGlobalInputSchema = z.object({
  slug: slugSchema,
  locale: localeSchema,
  draft: z.boolean(),
  depth: z.number().int().min(0).max(10),
})

export const updateGlobalInputSchema = findGlobalInputSchema.extend({
  data: jsonObjectSchema,
})

export type ListCollectionDocumentsInput = z.infer<typeof listCollectionDocumentsInputSchema>
export type FindCollectionDocumentInput = z.infer<typeof findCollectionDocumentInputSchema>
export type CreateCollectionDocumentInput = z.infer<typeof createCollectionDocumentInputSchema>
export type UpdateCollectionDocumentInput = z.infer<typeof updateCollectionDocumentInputSchema>
export type DeleteCollectionDocumentInput = z.infer<typeof deleteCollectionDocumentInputSchema>
export type FindGlobalInput = z.infer<typeof findGlobalInputSchema>
export type UpdateGlobalInput = z.infer<typeof updateGlobalInputSchema>
