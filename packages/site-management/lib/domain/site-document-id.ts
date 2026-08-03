import { z } from 'zod'

const siteDocumentIdSchema = z.string().trim().min(1).max(200)

export class SiteDocumentId {
  private constructor(readonly value: string) {
    Object.freeze(this)
  }

  static create(input: unknown): SiteDocumentId | Error {
    const parsed = siteDocumentIdSchema.safeParse(input)
    if (!parsed.success) {
      return new Error(`Invalid site document ID: ${parsed.error.issues[0]?.message ?? 'unknown'}`)
    }

    return new SiteDocumentId(parsed.data)
  }
}
