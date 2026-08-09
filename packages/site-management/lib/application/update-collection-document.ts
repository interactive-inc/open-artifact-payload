import type { JsonValue } from "../domain/json-value"
import { SiteDocumentTarget } from "../domain/site-document-target"
import type { PayloadRestClient } from "../infrastructure/payload-rest-client"
import {
  updateCollectionDocumentInputSchema,
  type UpdateCollectionDocumentInput,
} from "./site-management-inputs"

export class UpdateCollectionDocument {
  constructor(private readonly client: PayloadRestClient) {
    Object.freeze(this)
  }

  async execute(input: UpdateCollectionDocumentInput): Promise<JsonValue | Error> {
    const parsed = updateCollectionDocumentInputSchema.safeParse(input)
    if (!parsed.success) return new Error(parsed.error.message)

    const target = SiteDocumentTarget.create(parsed.data.slug, parsed.data.id)
    if (target instanceof Error) return target

    return await this.client.updateCollectionDocument({
      slug: target.slug,
      id: target.id,
      data: parsed.data.data,
    })
  }
}
