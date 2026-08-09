import type { JsonValue } from "../domain/json-value"
import { SiteResourceSlug } from "../domain/site-resource-slug"
import type { PayloadRestClient } from "../infrastructure/payload-rest-client"
import {
  listCollectionDocumentsInputSchema,
  type ListCollectionDocumentsInput,
} from "./site-management-inputs"

export class ListCollectionDocuments {
  constructor(private readonly client: PayloadRestClient) {
    Object.freeze(this)
  }

  async execute(input: ListCollectionDocumentsInput): Promise<JsonValue | Error> {
    const parsed = listCollectionDocumentsInputSchema.safeParse(input)
    if (!parsed.success) return new Error(parsed.error.message)

    const slug = SiteResourceSlug.create(parsed.data.slug)
    if (slug instanceof Error) return slug

    return await this.client.listCollection({
      slug,
      limit: parsed.data.limit,
      page: parsed.data.page,
      locale: parsed.data.locale,
      draft: parsed.data.draft,
      depth: parsed.data.depth,
    })
  }
}
