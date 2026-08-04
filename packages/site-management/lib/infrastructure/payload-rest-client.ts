import { jsonValueSchema, type JsonObject, type JsonValue } from '../domain/json-value'
import type { SiteDocumentId } from '../domain/site-document-id'
import type { SiteResourceSlug } from '../domain/site-resource-slug'
import type { SiteAuthentication } from '../runtime/load-site-management-config'
import type { FetchPort } from './fetch-port'
import { PayloadApiError } from './payload-api-error'

const requestTimeoutMilliseconds = 30_000

type ClientProps = {
  endpoint: string
  authentication: SiteAuthentication
  fetchPort: FetchPort
}

type RequestProps = {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  path: string
  query: ReadonlyArray<readonly [string, string]>
  body: JsonObject | null
}

type ListCollectionProps = {
  slug: SiteResourceSlug
  limit: number
  page: number
  locale: string | null
  draft: boolean
  depth: number
}

type DocumentProps = {
  slug: SiteResourceSlug
  id: SiteDocumentId
}

type WriteDocumentProps = DocumentProps & {
  data: JsonObject
}

type CreateDocumentProps = {
  slug: SiteResourceSlug
  data: JsonObject
}

type GlobalProps = {
  slug: SiteResourceSlug
  locale: string | null
  draft: boolean
  depth: number
}

type WriteGlobalProps = GlobalProps & {
  data: JsonObject
}

export class PayloadRestClient {
  private readonly endpoint: string
  private readonly authorization: string
  private readonly fetchPort: FetchPort

  constructor(props: ClientProps) {
    this.endpoint = `${props.endpoint.replace(/\/+$/, '')}/`
    this.authorization =
      props.authentication.kind === 'api-key'
        ? `${props.authentication.authCollection} API-Key ${props.authentication.apiKey}`
        : `JWT ${props.authentication.token}`
    this.fetchPort = props.fetchPort
    Object.freeze(this)
  }

  async listCollection(props: ListCollectionProps): Promise<JsonValue | Error> {
    const query: Array<readonly [string, string]> = [
      ['limit', String(props.limit)],
      ['page', String(props.page)],
      ['draft', String(props.draft)],
      ['depth', String(props.depth)],
    ]
    if (props.locale !== null) query.push(['locale', props.locale])

    return await this.request({
      method: 'GET',
      path: `api/${props.slug.value}`,
      query,
      body: null,
    })
  }

  async findCollectionDocument(props: DocumentProps): Promise<JsonValue | Error> {
    return await this.request({
      method: 'GET',
      path: `api/${props.slug.value}/${encodeURIComponent(props.id.value)}`,
      query: [],
      body: null,
    })
  }

  async createCollectionDocument(props: CreateDocumentProps): Promise<JsonValue | Error> {
    return await this.request({
      method: 'POST',
      path: `api/${props.slug.value}`,
      query: [],
      body: props.data,
    })
  }

  async updateCollectionDocument(props: WriteDocumentProps): Promise<JsonValue | Error> {
    return await this.request({
      method: 'PATCH',
      path: `api/${props.slug.value}/${encodeURIComponent(props.id.value)}`,
      query: [],
      body: props.data,
    })
  }

  async deleteCollectionDocument(props: DocumentProps): Promise<JsonValue | Error> {
    return await this.request({
      method: 'DELETE',
      path: `api/${props.slug.value}/${encodeURIComponent(props.id.value)}`,
      query: [],
      body: null,
    })
  }

  async findGlobal(props: GlobalProps): Promise<JsonValue | Error> {
    const query: Array<readonly [string, string]> = [
      ['draft', String(props.draft)],
      ['depth', String(props.depth)],
    ]
    if (props.locale !== null) query.push(['locale', props.locale])

    return await this.request({
      method: 'GET',
      path: `api/globals/${props.slug.value}`,
      query,
      body: null,
    })
  }

  async updateGlobal(props: WriteGlobalProps): Promise<JsonValue | Error> {
    const query: Array<readonly [string, string]> = [
      ['draft', String(props.draft)],
      ['depth', String(props.depth)],
    ]
    if (props.locale !== null) query.push(['locale', props.locale])

    return await this.request({
      method: 'POST',
      path: `api/globals/${props.slug.value}`,
      query,
      body: props.data,
    })
  }

  private async request(props: RequestProps): Promise<JsonValue | Error> {
    const url = new URL(props.path, this.endpoint)
    for (const queryEntry of props.query) url.searchParams.set(queryEntry[0], queryEntry[1])

    const headers = new Headers({
      Accept: 'application/json',
      Authorization: this.authorization,
    })
    if (props.body !== null) headers.set('Content-Type', 'application/json')

    let response: Response
    try {
      response = await this.fetchPort(url, {
        method: props.method,
        headers,
        body: props.body === null ? null : JSON.stringify(props.body),
        signal: AbortSignal.timeout(requestTimeoutMilliseconds),
      })
    } catch (cause) {
      return cause instanceof Error ? cause : new Error('Payload API request failed')
    }

    const responseBody = await this.readResponse(response)
    if (responseBody instanceof Error) {
      if (!response.ok) return new PayloadApiError(response.status, responseBody.message)
      return responseBody
    }
    if (!response.ok) return new PayloadApiError(response.status, responseBody)

    return responseBody
  }

  private async readResponse(response: Response): Promise<JsonValue | Error> {
    if (response.status === 204) return null

    let raw: unknown
    try {
      raw = await response.json()
    } catch {
      return new Error(`Payload API returned a non-JSON response with HTTP ${response.status}`)
    }

    const parsed = jsonValueSchema.safeParse(raw)
    if (!parsed.success) return new Error('Payload API returned an invalid JSON response')

    return parsed.data
  }
}
