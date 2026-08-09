import { jsonObjectSchema } from "@open-artifact/site-management"
import { z } from "zod"

const slugSchema = z.string().min(1)
const idSchema = z.string().min(1)
const localeSchema = z.string().min(1).nullable().default(null)
const draftSchema = z
  .enum(["true", "false"])
  .default("false")
  .transform((value) => value === "true")
const depthSchema = z.coerce.number().int().min(0).max(10).default(0)

const jsonObjectTextSchema = z.string().transform((value, context) => {
  let raw: unknown
  try {
    raw = JSON.parse(value)
  } catch {
    context.addIssue({ code: "custom", message: "data must be valid JSON" })
    return z.NEVER
  }

  const parsed = jsonObjectSchema.safeParse(raw)
  if (!parsed.success) {
    context.addIssue({ code: "custom", message: "data must be a JSON object" })
    return z.NEVER
  }

  return parsed.data
})

export const listCollectionCliInputSchema = z
  .object({
    slug: slugSchema,
    limit: z.coerce.number().int().min(1).max(100).default(10),
    page: z.coerce.number().int().min(1).default(1),
    locale: localeSchema,
    draft: draftSchema,
    depth: depthSchema,
  })
  .strict()

export const findCollectionCliInputSchema = z
  .object({
    slug: slugSchema,
    id: idSchema,
  })
  .strict()

export const createCollectionCliInputSchema = z
  .object({
    slug: slugSchema,
    data: jsonObjectTextSchema,
  })
  .strict()

export const updateCollectionCliInputSchema = z
  .object({
    slug: slugSchema,
    id: idSchema,
    data: jsonObjectTextSchema,
  })
  .strict()

export const deleteCollectionCliInputSchema = findCollectionCliInputSchema

export const findGlobalCliInputSchema = z
  .object({
    slug: slugSchema,
    locale: localeSchema,
    draft: draftSchema,
    depth: depthSchema,
  })
  .strict()

export const updateGlobalCliInputSchema = findGlobalCliInputSchema.extend({
  data: jsonObjectTextSchema,
})
