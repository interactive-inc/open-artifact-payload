import type { JsonValue } from '../domain/json-value'
import { SiteDocumentTarget } from '../domain/site-document-target'
import type { PayloadRestClient } from '../infrastructure/payload-rest-client'
import {
  findCollectionDocumentInputSchema,
  type FindCollectionDocumentInput,
} from './site-management-inputs'

export class FindCollectionDocument {
  constructor(private readonly client: PayloadRestClient) {
    Object.freeze(this)
  }

  async execute(input: FindCollectionDocumentInput): Promise<JsonValue | Error> {
    const parsed = findCollectionDocumentInputSchema.safeParse(input)
    if (!parsed.success) return new Error(parsed.error.message)

    const target = SiteDocumentTarget.create(parsed.data.slug, parsed.data.id)
    if (target instanceof Error) return target

    return await this.client.findCollectionDocument({ slug: target.slug, id: target.id })
  }
}
