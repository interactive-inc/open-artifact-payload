import { SiteDocumentId } from './site-document-id'
import { SiteResourceSlug } from './site-resource-slug'

export class SiteDocumentTarget {
  private constructor(
    readonly slug: SiteResourceSlug,
    readonly id: SiteDocumentId,
  ) {
    Object.freeze(this)
  }

  static create(slugInput: unknown, idInput: unknown): SiteDocumentTarget | Error {
    const slug = SiteResourceSlug.create(slugInput)
    if (slug instanceof Error) return slug

    const id = SiteDocumentId.create(idInput)
    if (id instanceof Error) return id

    return new SiteDocumentTarget(slug, id)
  }
}
