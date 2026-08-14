import { CreateCollectionDocument } from "../application/create-collection-document"
import { DeleteCollectionDocument } from "../application/delete-collection-document"
import { FindCollectionDocument } from "../application/find-collection-document"
import { FindGlobal } from "../application/find-global"
import { ListCollectionDocuments } from "../application/list-collection-documents"
import type {
  CreateCollectionDocumentInput,
  DeleteCollectionDocumentInput,
  FindCollectionDocumentInput,
  FindGlobalInput,
  ListCollectionDocumentsInput,
  UpdateCollectionDocumentInput,
  UpdateGlobalInput,
} from "../application/site-management-inputs"
import { UpdateCollectionDocument } from "../application/update-collection-document"
import { UpdateGlobal } from "../application/update-global"
import type { JsonValue } from "../domain/json-value"
import type { FetchPort } from "../infrastructure/fetch-port"
import { PayloadRestClient } from "../infrastructure/payload-rest-client"
import { loadSiteManagementConfig } from "./load-site-management-config"

type BuildProps = {
  env: unknown
  fetchPort: FetchPort
}

type Built = {
  listCollectionDocuments: ListCollectionDocuments
  findCollectionDocument: FindCollectionDocument
  createCollectionDocument: CreateCollectionDocument
  updateCollectionDocument: UpdateCollectionDocument
  deleteCollectionDocument: DeleteCollectionDocument
  findGlobal: FindGlobal
  updateGlobal: UpdateGlobal
}

export class SiteManagementRuntime {
  private constructor(private readonly built: Built) {
    Object.freeze(this)
  }

  static build(props: BuildProps): SiteManagementRuntime | Error {
    const config = loadSiteManagementConfig(props.env)
    if (config instanceof Error) return config

    const client = new PayloadRestClient({
      endpoint: config.endpoint,
      authentication: config.authentication,
      fetchPort: props.fetchPort,
    })

    return new SiteManagementRuntime({
      listCollectionDocuments: new ListCollectionDocuments(client),
      findCollectionDocument: new FindCollectionDocument(client),
      createCollectionDocument: new CreateCollectionDocument(client),
      updateCollectionDocument: new UpdateCollectionDocument(client),
      deleteCollectionDocument: new DeleteCollectionDocument(client),
      findGlobal: new FindGlobal(client),
      updateGlobal: new UpdateGlobal(client),
    })
  }

  async listCollectionDocuments(input: ListCollectionDocumentsInput): Promise<JsonValue | Error> {
    return await this.built.listCollectionDocuments.execute(input)
  }

  async findCollectionDocument(input: FindCollectionDocumentInput): Promise<JsonValue | Error> {
    return await this.built.findCollectionDocument.execute(input)
  }

  async createCollectionDocument(input: CreateCollectionDocumentInput): Promise<JsonValue | Error> {
    return await this.built.createCollectionDocument.execute(input)
  }

  async updateCollectionDocument(input: UpdateCollectionDocumentInput): Promise<JsonValue | Error> {
    return await this.built.updateCollectionDocument.execute(input)
  }

  async deleteCollectionDocument(input: DeleteCollectionDocumentInput): Promise<JsonValue | Error> {
    return await this.built.deleteCollectionDocument.execute(input)
  }

  async findGlobal(input: FindGlobalInput): Promise<JsonValue | Error> {
    return await this.built.findGlobal.execute(input)
  }

  async updateGlobal(input: UpdateGlobalInput): Promise<JsonValue | Error> {
    return await this.built.updateGlobal.execute(input)
  }
}
