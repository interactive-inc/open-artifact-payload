import { z } from "zod"

const siteResourceSlugSchema = z
  .string()
  .min(1)
  .max(100)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "must be a lowercase kebab-case slug")

export class SiteResourceSlug {
  private constructor(readonly value: string) {
    Object.freeze(this)
  }

  static create(input: unknown): SiteResourceSlug | Error {
    const parsed = siteResourceSlugSchema.safeParse(input)
    if (!parsed.success) {
      return new Error(
        `Invalid site resource slug: ${parsed.error.issues[0]?.message ?? "unknown"}`,
      )
    }

    return new SiteResourceSlug(parsed.data)
  }
}
