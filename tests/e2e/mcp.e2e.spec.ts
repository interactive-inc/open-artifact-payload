import { expect, test, type APIRequestContext } from "@playwright/test"
import { z } from "zod"

import { previewMcpApiKeys, testUser } from "../helpers/seed-user"

const baseURL = "http://localhost:3000"
const documentSchema = z.object({ id: z.number(), title: z.string(), _status: z.string() })
const documentsSchema = z.object({ docs: z.array(documentSchema) })

type Props = {
  request: APIRequestContext
  endpoint: string
  apiKey: string
  method: string
  params: Record<string, unknown>
}

async function postMcp(props: Props): Promise<Record<string, unknown>> {
  const response = await props.request.post(`${baseURL}${props.endpoint}`, {
    headers: {
      accept: "application/json, text/event-stream",
      authorization: `Bearer ${props.apiKey}`,
    },
    data: { jsonrpc: "2.0", id: 1, method: props.method, params: props.params },
  })
  const body = await response.text()

  expect(response.status(), body).toBe(200)

  const message = body.split("\n").find((line) => line.startsWith("data: "))
  const envelope = z.object({ result: z.record(z.string(), z.unknown()) })

  return envelope.parse(JSON.parse(message ? message.slice(6) : body)).result
}

test("MCP rejects missing and expired keys over HTTP", async ({ request }) => {
  for (const endpoint of ["/api/mcp", "/api/mcp/"]) {
    for (const apiKey of [null, previewMcpApiKeys.expired]) {
      const response = await request.post(`${baseURL}${endpoint}`, {
        headers: {
          accept: "application/json, text/event-stream",
          ...(apiKey ? { authorization: `Bearer ${apiKey}` } : {}),
        },
        data: { jsonrpc: "2.0", id: 1, method: "tools/list", params: {} },
      })

      expect(response.status()).toBe(401)
    }
  }
})

for (const endpoint of ["/api/mcp", "/api/mcp/"]) {
  test(`MCP initializes and creates, updates and reads a private draft via ${endpoint}`, async ({
    request,
    playwright,
  }) => {
    const login = await request.post(`${baseURL}/api/users/login`, { data: testUser })

    expect(login.ok()).toBe(true)

    const user = z.object({ user: z.object({ id: z.number() }) }).parse(await login.json()).user
    const marker = `mcp-http-${crypto.randomUUID()}`
    const apiKey = crypto.randomUUID()
    const createdKey = await request.post(`${baseURL}/api/payload-mcp-api-keys`, {
      data: {
        user: user.id,
        label: marker,
        enableAPIKey: true,
        apiKey,
        news: { find: true, create: true, update: true },
      },
    })

    expect(createdKey.status()).toBe(201)

    const keyId = z.object({ doc: z.object({ id: z.number() }) }).parse(await createdKey.json())
      .doc.id
    const invoke = (method: string, params: Record<string, unknown>) =>
      postMcp({ request, endpoint, apiKey, method, params })
    const documentsURL = `${baseURL}/api/news?where[slug][equals]=${marker}&draft=true`

    try {
      const initialized = await invoke("initialize", {
        protocolVersion: "2025-03-26",
        capabilities: {},
        clientInfo: { name: "mcp-http-e2e", version: "1.0.0" },
      })

      expect(initialized).toHaveProperty("serverInfo")

      const listed = z
        .object({ tools: z.array(z.object({ name: z.string() })) })
        .parse(await invoke("tools/list", {}))

      expect(listed.tools.map((tool) => tool.name).sort()).toEqual([
        "createNews",
        "findNews",
        "updateNews",
      ])

      await invoke("tools/call", {
        name: "createNews",
        arguments: {
          title: marker,
          slug: marker,
          publishedAt: "2026-01-01T00:00:00.000Z",
          category: "info",
          _status: "draft",
          draft: true,
        },
      })

      const created = documentsSchema.parse(await (await request.get(documentsURL)).json())

      expect(created.docs).toHaveLength(1)

      const document = documentSchema.parse(created.docs[0])
      const updatedTitle = `${marker} updated over MCP`

      const invalid = await invoke("tools/call", {
        name: "updateNews",
        arguments: { id: document.id, title: 42, draft: true },
      })

      expect(invalid).toMatchObject({ isError: true })

      await invoke("tools/call", {
        name: "updateNews",
        arguments: { id: document.id, title: updatedTitle, draft: true },
      })

      const read = await invoke("tools/call", {
        name: "findNews",
        arguments: { id: document.id, draft: true },
      })

      expect(JSON.stringify(read)).toContain(updatedTitle)

      const saved = documentsSchema.parse(await (await request.get(documentsURL)).json())

      expect(saved.docs).toEqual([{ id: document.id, title: updatedTitle, _status: "draft" }])

      const anonymous = await playwright.request.newContext()

      try {
        const visible = await anonymous.get(`${baseURL}/api/news?where[slug][equals]=${marker}`)

        expect(documentsSchema.parse(await visible.json()).docs).toHaveLength(0)
      } finally {
        await anonymous.dispose()
      }
    } finally {
      const remaining = documentsSchema.parse(await (await request.get(documentsURL)).json())

      for (const document of remaining.docs) {
        expect((await request.delete(`${baseURL}/api/news/${document.id}`)).ok()).toBe(true)
      }

      expect((await request.delete(`${baseURL}/api/payload-mcp-api-keys/${keyId}`)).ok()).toBe(true)
    }
  })
}
