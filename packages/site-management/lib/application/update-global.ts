import type { JsonValue } from "../domain/json-value"
import { SiteResourceSlug } from "../domain/site-resource-slug"
import type { PayloadRestClient } from "../infrastructure/payload-rest-client"
import { updateGlobalInputSchema, type UpdateGlobalInput } from "./site-management-inputs"

export class UpdateGlobal {
  constructor(private readonly client: PayloadRestClient) {
    Object.freeze(this)
  }

  async execute(input: UpdateGlobalInput): Promise<JsonValue | Error> {
    const parsed = updateGlobalInputSchema.safeParse(input)
    if (!parsed.success) return new Error(parsed.error.message)

    const slug = SiteResourceSlug.create(parsed.data.slug)
    if (slug instanceof Error) return slug

    return await this.client.updateGlobal({
      slug,
      locale: parsed.data.locale,
      draft: parsed.data.draft,
      depth: parsed.data.depth,
      data: parsed.data.data,
    })
  }
}
