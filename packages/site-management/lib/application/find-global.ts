import type { JsonValue } from "../domain/json-value"
import { SiteResourceSlug } from "../domain/site-resource-slug"
import type { PayloadRestClient } from "../infrastructure/payload-rest-client"
import { findGlobalInputSchema, type FindGlobalInput } from "./site-management-inputs"

export class FindGlobal {
  constructor(private readonly client: PayloadRestClient) {
    Object.freeze(this)
  }

  async execute(input: FindGlobalInput): Promise<JsonValue | Error> {
    const parsed = findGlobalInputSchema.safeParse(input)
    if (!parsed.success) return new Error(parsed.error.message)

    const slug = SiteResourceSlug.create(parsed.data.slug)
    if (slug instanceof Error) return slug

    return await this.client.findGlobal({
      slug,
      locale: parsed.data.locale,
      draft: parsed.data.draft,
      depth: parsed.data.depth,
    })
  }
}
