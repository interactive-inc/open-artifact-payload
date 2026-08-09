import { getPayload, handleEndpoints } from "payload"
import { describe, expect, test } from "vite-plus/test"

import config from "@/payload.config"

const postMcp = async (props: {
  apiKey?: string
  body: Record<string, unknown>
}): Promise<Response> => {
  const payloadConfig = await config
  const headers = new Headers({
    accept: "application/json, text/event-stream",
    "content-type": "application/json",
  })
  if (props.apiKey) headers.set("authorization", `Bearer ${props.apiKey}`)

  return await handleEndpoints({
    config: payloadConfig,
    request: new Request("http://payload.local/api/mcp", {
      method: "POST",
      headers,
      body: JSON.stringify(props.body),
    }),
  })
}

const readToolNames = async (response: Response): Promise<string[]> => {
  const body = await response.text()
  const dataLine = body.split("\n").find((line) => line.startsWith("data: "))
  expect(dataLine).toBeDefined()
  if (!dataLine) return []

  const decoded: unknown = JSON.parse(dataLine.slice("data: ".length))
  expect(decoded).toBeTypeOf("object")
  if (typeof decoded !== "object" || decoded === null) return []

  const result = Reflect.get(decoded, "result")
  expect(result).toBeTypeOf("object")
  if (typeof result !== "object" || result === null) return []

  const tools = Reflect.get(result, "tools")
  expect(Array.isArray(tools)).toBe(true)
  if (!Array.isArray(tools)) return []

  return tools.flatMap((tool) => {
    if (typeof tool !== "object" || tool === null) return []
    const name = Reflect.get(tool, "name")
    return typeof name === "string" ? [name] : []
  })
}

const readToolResultText = async (response: Response): Promise<string> => {
  const body = await response.text()
  const dataLine = body.split("\n").find((line) => line.startsWith("data: "))
  expect(dataLine).toBeDefined()
  if (!dataLine) return ""

  const decoded: unknown = JSON.parse(dataLine.slice("data: ".length))
  expect(decoded).toBeTypeOf("object")
  if (typeof decoded !== "object" || decoded === null) return ""

  const result = Reflect.get(decoded, "result")
  expect(result).toBeTypeOf("object")
  if (typeof result !== "object" || result === null) return ""

  const content = Reflect.get(result, "content")
  expect(Array.isArray(content)).toBe(true)
  if (!Array.isArray(content)) return ""

  return content
    .flatMap((item) => {
      if (typeof item !== "object" || item === null) return []
      const text = Reflect.get(item, "text")
      return typeof text === "string" ? [text] : []
    })
    .join("\n")
}

describe("official Payload MCP plugin", () => {
  test("rejects requests without an MCP API key", async () => {
    const response = await postMcp({
      body: { jsonrpc: "2.0", id: 1, method: "tools/list", params: {} },
    })

    expect(response.status).toBe(401)
  })

  test("exposes only capabilities enabled on the MCP API key", async () => {
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })
    const user = await payload.create({
      collection: "users",
      data: {
        email: `mcp-plugin-${crypto.randomUUID()}@example.com`,
        password: "test-password-1234",
        roles: ["admin"],
      },
    })
    const apiKey = `mcp-plugin-${crypto.randomUUID()}`

    await payload.create({
      collection: "payload-mcp-api-keys",
      data: {
        user: user.id,
        label: "Integration test",
        enableAPIKey: true,
        apiKey,
        news: { find: true, create: false, update: false },
        service: { find: true, update: true },
      },
    })

    const response = await postMcp({
      apiKey,
      body: { jsonrpc: "2.0", id: 1, method: "tools/list", params: {} },
    })
    expect(response.status).toBe(200)

    const toolNames = await readToolNames(response)
    expect(toolNames).toEqual(["findNews", "findService", "updateService"])

    const slug = `mcp-readable-${crypto.randomUUID()}`
    await payload.create({
      collection: "news",
      data: {
        title: "MCP readable news",
        slug,
        publishedAt: new Date().toISOString(),
        category: "info",
        _status: "draft",
      },
    })

    const findResponse = await postMcp({
      apiKey,
      body: {
        jsonrpc: "2.0",
        id: 2,
        method: "tools/call",
        params: {
          name: "findNews",
          arguments: {
            where: JSON.stringify({ slug: { equals: slug } }),
            draft: true,
          },
        },
      },
    })

    expect(findResponse.status).toBe(200)
    expect(await findResponse.text()).toContain(slug)
  })

  test("allows only administrators to manage MCP API keys", async () => {
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })
    const editor = await payload.create({
      collection: "users",
      data: {
        email: `mcp-editor-${crypto.randomUUID()}@example.com`,
        password: "test-password-1234",
        roles: ["editor"],
      },
    })
    const administrator = await payload.create({
      collection: "users",
      data: {
        email: `mcp-admin-${crypto.randomUUID()}@example.com`,
        password: "test-password-1234",
        roles: ["admin"],
      },
    })
    const editorApiKey = `mcp-editor-key-${crypto.randomUUID()}`

    await expect(
      payload.find({
        collection: "payload-mcp-api-keys",
        overrideAccess: false,
        user: editor,
      }),
    ).rejects.toThrow()
    await expect(
      payload.create({
        collection: "payload-mcp-api-keys",
        data: {
          user: editor.id,
          label: "Forbidden editor key",
          enableAPIKey: true,
          apiKey: `forbidden-${crypto.randomUUID()}`,
          news: { find: true, create: false, update: false },
        },
        overrideAccess: false,
        user: editor,
      }),
    ).rejects.toThrow()

    const visible = await payload.find({
      collection: "payload-mcp-api-keys",
      overrideAccess: false,
      user: administrator,
    })
    expect(visible.totalDocs).toBeGreaterThanOrEqual(0)

    await payload.create({
      collection: "payload-mcp-api-keys",
      data: {
        user: editor.id,
        label: "Administrator-managed editor key",
        enableAPIKey: true,
        apiKey: editorApiKey,
        news: { find: true, create: false, update: false },
      },
      overrideAccess: false,
      user: administrator,
    })
    const editorTools = await readToolNames(
      await postMcp({
        apiKey: editorApiKey,
        body: { jsonrpc: "2.0", id: 1, method: "tools/list", params: {} },
      }),
    )
    expect(editorTools).toEqual(["findNews"])

    const directCreateResponse = await handleEndpoints({
      config: payloadConfig,
      request: new Request("http://payload.local/api/news", {
        method: "POST",
        headers: {
          authorization: `payload-mcp-api-keys API-Key ${editorApiKey}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          title: "MCP capability bypass attempt",
          slug: `mcp-bypass-${crypto.randomUUID()}`,
          publishedAt: new Date().toISOString(),
          category: "info",
          _status: "draft",
        }),
      }),
    })
    expect(directCreateResponse.status).toBe(403)

    const directUsersResponse = await handleEndpoints({
      config: payloadConfig,
      request: new Request("http://payload.local/api/users", {
        headers: {
          authorization: `payload-mcp-api-keys API-Key ${editorApiKey}`,
        },
      }),
    })
    expect(directUsersResponse.status).toBe(403)
  })

  test("rejects expired MCP API keys", async () => {
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })
    const user = await payload.create({
      collection: "users",
      data: {
        email: `mcp-expired-${crypto.randomUUID()}@example.com`,
        password: "test-password-1234",
        roles: ["admin"],
      },
    })
    const apiKey = `mcp-expired-${crypto.randomUUID()}`
    await payload.create({
      collection: "payload-mcp-api-keys",
      data: {
        user: user.id,
        label: "Expired integration test key",
        enableAPIKey: true,
        apiKey,
        expiresAt: new Date(Date.now() - 1_000).toISOString(),
        news: { find: true, create: false, update: false },
      },
    })

    const response = await postMcp({
      apiKey,
      body: { jsonrpc: "2.0", id: 1, method: "tools/list", params: {} },
    })
    expect(response.status).toBe(401)
  })

  test("creates, finds, and updates news through MCP tools without exposing deletion", async () => {
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })
    const user = await payload.create({
      collection: "users",
      data: {
        email: `mcp-crud-${crypto.randomUUID()}@example.com`,
        password: "test-password-1234",
        roles: ["admin"],
      },
    })
    const apiKey = `mcp-crud-${crypto.randomUUID()}`

    await payload.create({
      collection: "payload-mcp-api-keys",
      data: {
        user: user.id,
        label: "News CRUD integration test",
        enableAPIKey: true,
        apiKey,
        news: { find: true, create: true, update: true },
      },
    })

    const slug = `mcp-crud-${crypto.randomUUID()}`
    const originalTitle = "MCP CRUD news"
    const updatedTitle = "MCP CRUD news updated"
    const createResponse = await postMcp({
      apiKey,
      body: {
        jsonrpc: "2.0",
        id: 1,
        method: "tools/call",
        params: {
          name: "createNews",
          arguments: {
            title: originalTitle,
            slug,
            publishedAt: new Date().toISOString(),
            category: "info",
            _status: "draft",
            draft: true,
          },
        },
      },
    })

    expect(createResponse.status).toBe(200)
    const createResult = await readToolResultText(createResponse)
    expect(createResult).toContain("Resource created successfully")
    expect(createResult).toContain(slug)

    const createdDocuments = await payload.find({
      collection: "news",
      draft: true,
      limit: 1,
      where: { slug: { equals: slug } },
    })
    expect(createdDocuments.docs).toHaveLength(1)
    const createdDocument = createdDocuments.docs[0]
    expect(createdDocument).toBeDefined()
    if (!createdDocument) return

    const findResponse = await postMcp({
      apiKey,
      body: {
        jsonrpc: "2.0",
        id: 2,
        method: "tools/call",
        params: {
          name: "findNews",
          arguments: { id: createdDocument.id, draft: true },
        },
      },
    })

    expect(findResponse.status).toBe(200)
    const findResult = await readToolResultText(findResponse)
    expect(findResult).toContain(originalTitle)
    expect(findResult).toContain(slug)

    const updateResponse = await postMcp({
      apiKey,
      body: {
        jsonrpc: "2.0",
        id: 3,
        method: "tools/call",
        params: {
          name: "updateNews",
          arguments: {
            id: createdDocument.id,
            title: updatedTitle,
            category: "press",
            draft: true,
          },
        },
      },
    })

    expect(updateResponse.status).toBe(200)
    const updateResult = await readToolResultText(updateResponse)
    expect(updateResult).toContain("Document updated successfully")
    expect(updateResult).toContain(updatedTitle)

    const updatedDocument = await payload.findByID({
      collection: "news",
      id: createdDocument.id,
      draft: true,
    })
    expect(updatedDocument.title).toBe(updatedTitle)
    expect(updatedDocument.category).toBe("press")

    const toolsResponse = await postMcp({
      apiKey,
      body: { jsonrpc: "2.0", id: 4, method: "tools/list", params: {} },
    })
    expect(await readToolNames(toolsResponse)).not.toContain("deleteNews")

    await payload.delete({ collection: "news", id: createdDocument.id })
  })
})
