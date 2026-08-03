import type { JsonValue } from '../domain/json-value'
import { SiteResourceSlug } from '../domain/site-resource-slug'
import type { PayloadRestClient } from '../infrastructure/payload-rest-client'
import {
  createCollectionDocumentInputSchema,
  type CreateCollectionDocumentInput,
} from './site-management-inputs'

export class CreateCollectionDocument {
  constructor(private readonly client: PayloadRestClient) {
    Object.freeze(this)
  }

  async execute(input: CreateCollectionDocumentInput): Promise<JsonValue | Error> {
    const parsed = createCollectionDocumentInputSchema.safeParse(input)
    if (!parsed.success) return new Error(parsed.error.message)

    const slug = SiteResourceSlug.create(parsed.data.slug)
    if (slug instanceof Error) return slug

    return await this.client.createCollectionDocument({ slug, data: parsed.data.data })
  }
}
