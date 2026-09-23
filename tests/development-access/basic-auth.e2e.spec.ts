import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"

import { expect, test, type APIRequestContext } from "@playwright/test"
import { z } from "zod"

import { runCli } from "../../packages/cli/lib/run-cli"
import { previewMcpApiKeys, testUser } from "../helpers/seed-user"

const endpoint = "https://localhost:3000"
const authorization = `Basic ${Buffer.from("basic-e2e:basic-e2e-password").toString("base64")}`
const documentSchema = z.object({
  doc: z.object({ id: z.number(), title: z.string(), _status: z.string() }),
})

async function invokeMcp(
  request: APIRequestContext,
  apiKey: string,
  method: string,
  params: Record<string, unknown>,
) {
  const response = await request.post("/api/mcp/", {
    headers: {
      authorization,
      "X-IntaCMS-Authorization": `Bearer ${apiKey}`,
      accept: "application/json, text/event-stream",
    },
    data: { jsonrpc: "2.0", id: 1, method, params },
  })
  const body = await response.text()
  expect(response.status(), body).toBe(200)
  const message = body.split("\n").find((line) => line.startsWith("data: "))
  return z
    .object({ result: z.record(z.string(), z.unknown()) })
    .parse(JSON.parse(message ? message.slice(6) : body)).result
}

test("Worker requires both Basic and CMS credentials", async ({ request }) => {
  for (const path of ["/", "/admin/", "/api/mcp/", "/api/news/", "/_next/static/missing.js"]) {
    const response = await request.get(path, {
      headers: { "X-IntaCMS-Authorization": `Bearer ${previewMcpApiKeys.active}` },
    })
    expect(response.status()).toBe(401)
    expect(response.headers()["www-authenticate"]).toContain("Basic")
  }
  for (const cms of [null, "Bearer invalid", `Bearer ${previewMcpApiKeys.expired}`]) {
    const response = await request.post("/api/mcp/", {
      headers: {
        authorization,
        ...(cms ? { "X-IntaCMS-Authorization": cms } : {}),
        accept: "application/json, text/event-stream",
      },
      data: { jsonrpc: "2.0", id: 1, method: "tools/list", params: {} },
    })
    expect(response.status()).toBe(401)
    expect(response.headers()["www-authenticate"]).toBeUndefined()
  }
  const rejectedWrite = await request.post("/api/news/", {
    headers: { authorization },
    data: { title: "must not be created" },
  })
  expect(rejectedWrite.status()).toBe(403)
})

test("CLI logs in, creates and updates a draft, and MCP reads and updates it through Basic", async ({
  request,
  playwright,
}) => {
  const configDirectory = await mkdtemp(join(tmpdir(), "intacms-basic-e2e-"))
  const cliContext = await playwright.request.newContext({ ignoreHTTPSErrors: true })
  const env = {
    INTACMS_CONFIG_DIR: configDirectory,
    INTACMS_STAGING_ENDPOINT: endpoint,
    INTACMS_STAGING_BASIC_AUTH_USERNAME: "basic-e2e",
    INTACMS_STAGING_BASIC_AUTH_PASSWORD: "basic-e2e-password",
  }
  // Use Playwright's TLS trust for this local self-signed Worker; CLI still constructs every header and URL.
  const run = async (argv: ReadonlyArray<string>) => {
    const output: string[] = []
    const errors: string[] = []
    const exitCode = await runCli({
      argv: [...argv, "--staging"],
      env,
      fetchPort: async (input, init) => {
        const headers = Object.fromEntries(new Headers(init.headers))
        const response = await cliContext.fetch(
          input instanceof Request ? input.url : String(input),
          {
            method: init.method,
            headers,
            data: typeof init.body === "string" ? init.body : undefined,
            maxRedirects: 0,
          },
        )
        return new Response(await response.text(), {
          status: response.status(),
          headers: response.headers(),
        })
      },
      io: {
        writeOutput: (value) => output.push(value),
        writeError: (value) => errors.push(value),
        readSecret: async () => testUser.password,
      },
    })
    expect(exitCode, errors.join("\n")).toBe(0)
    return JSON.parse(output.join(""))
  }

  const marker = `basic-e2e-${crypto.randomUUID()}`
  let documentId: number | null = null
  let keyId: number | null = null
  try {
    // Separate browser-style admin session also lets cleanup run if a CLI assertion fails.
    const login = await request.post("/api/users/login/", {
      headers: { authorization },
      data: testUser,
    })
    expect(login.ok()).toBe(true)

    await run(["login", "--email", testUser.email])
    const me = z.object({ user: z.object({ id: z.number() }) }).parse(await run(["whoami"]))
    const created = documentSchema.parse(
      await run([
        "news",
        "create",
        "--title",
        marker,
        "--slug",
        marker,
        "--category",
        "info",
        "--published-at",
        "2026-01-01T00:00:00.000Z",
        "--draft",
      ]),
    )
    documentId = created.doc.id
    await run(["news", String(documentId), "update", "--title", `${marker} CLI`, "--draft"])

    // Admin cookies remain usable behind Basic (also the browser/WebMCP authentication path).
    const apiKey = crypto.randomUUID()
    const keyResponse = await request.post("/api/payload-mcp-api-keys/", {
      headers: { authorization },
      data: {
        user: me.user.id,
        label: marker,
        enableAPIKey: true,
        apiKey,
        news: { find: true, create: true, update: true },
      },
    })
    expect(keyResponse.status()).toBe(201)
    keyId = z.object({ doc: z.object({ id: z.number() }) }).parse(await keyResponse.json()).doc.id

    // Separate context ensures MCP uses its key rather than the admin's cookie.
    const mcpContext = await playwright.request.newContext({
      baseURL: endpoint,
      ignoreHTTPSErrors: true,
    })
    try {
      expect(
        await invokeMcp(mcpContext, apiKey, "initialize", {
          protocolVersion: "2025-03-26",
          capabilities: {},
          clientInfo: { name: "basic-e2e", version: "1" },
        }),
      ).toHaveProperty("serverInfo")
      const tools = await invokeMcp(mcpContext, apiKey, "tools/list", {})
      expect(JSON.stringify(tools)).toContain("updateNews")
      expect(
        JSON.stringify(
          await invokeMcp(mcpContext, apiKey, "tools/call", {
            name: "findNews",
            arguments: { id: documentId, draft: true },
          }),
        ),
      ).toContain(`${marker} CLI`)
      const updated = await invokeMcp(mcpContext, apiKey, "tools/call", {
        name: "updateNews",
        arguments: { id: documentId, title: `${marker} MCP`, draft: true },
      })
      expect(updated.isError).not.toBe(true)
    } finally {
      await mcpContext.dispose()
    }

    const drafts = z
      .object({
        docs: z.array(z.object({ id: z.number(), title: z.string(), _status: z.string() })),
      })
      .parse(await run(["news", "--draft", "--limit", "100"]))
    const saved = drafts.docs.find((document) => document.id === documentId)
    expect(saved).toMatchObject({ title: `${marker} MCP`, _status: "draft" })
    const protectedResponse = await request.get(`/api/news/${documentId}/?draft=true`, {
      headers: { authorization },
    })
    expect(protectedResponse.headers()["cache-control"]).toBe("private, no-store")
    expect(protectedResponse.headers()["x-robots-tag"]).toContain("noindex")
    await run(["logout"])
  } finally {
    if (documentId !== null)
      expect(
        (await request.delete(`/api/news/${documentId}/`, { headers: { authorization } })).ok(),
      ).toBe(true)
    if (keyId !== null)
      expect(
        (
          await request.delete(`/api/payload-mcp-api-keys/${keyId}/`, {
            headers: { authorization },
          })
        ).ok(),
      ).toBe(true)
    await cliContext.dispose()
    await rm(configDirectory, { recursive: true, force: true })
  }
})
