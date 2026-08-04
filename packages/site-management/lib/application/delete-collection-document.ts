import type { JsonValue } from '../domain/json-value'
import { SiteDocumentTarget } from '../domain/site-document-target'
import type { PayloadRestClient } from '../infrastructure/payload-rest-client'
import {
  deleteCollectionDocumentInputSchema,
  type DeleteCollectionDocumentInput,
} from './site-management-inputs'

export class DeleteCollectionDocument {
  constructor(private readonly client: PayloadRestClient) {
    Object.freeze(this)
  }

  async execute(input: DeleteCollectionDocumentInput): Promise<JsonValue | Error> {
    const parsed = deleteCollectionDocumentInputSchema.safeParse(input)
    if (!parsed.success) return new Error(parsed.error.message)

    const target = SiteDocumentTarget.create(parsed.data.slug, parsed.data.id)
    if (target instanceof Error) return target

    return await this.client.deleteCollectionDocument({ slug: target.slug, id: target.id })
  }
}
