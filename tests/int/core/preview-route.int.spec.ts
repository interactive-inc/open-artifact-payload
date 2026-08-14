import { getPayload, type Payload } from "payload"
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vite-plus/test"

const nextMocks = vi.hoisted(() => ({
  enableDraftMode: vi.fn(),
  redirect: vi.fn((path: string) => {
    throw new Error(`redirect:${path}`)
  }),
}))

vi.mock("next/headers", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/headers")>()),
  draftMode: vi.fn(async () => ({ enable: nextMocks.enableDraftMode })),
}))

vi.mock("next/navigation", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/navigation")>()),
  redirect: nextMocks.redirect,
}))

import { GET } from "@/app/(frontend)/next/preview/route"
import config from "@/payload.config"

type Role = "admin" | "editor" | "serviceAdmin"

const password = "test-password-1234"
let payload: Payload
const userIds: number[] = []
const mcpKeyIds: number[] = []
const sessionTokens = new Map<Role, string>()
let usersApiKey = ""
let activeMcpApiKey = ""
let expiredMcpApiKey = ""

async function createSession(role: Role): Promise<void> {
  const email = `preview-${role}-${crypto.randomUUID()}@example.com`
  usersApiKey ||= `preview-user-key-${crypto.randomUUID()}`
  const user = await payload.create({
    collection: "users",
    data: {
      email,
      password,
      roles: [role],
      ...(role === "admin" ? { enableAPIKey: true, apiKey: usersApiKey } : {}),
    },
  })
  userIds.push(user.id)

  const result = await payload.login({ collection: "users", data: { email, password } })
  if (!result.token) throw new Error(`${role} のテスト用セッションを作成できませんでした`)
  sessionTokens.set(role, result.token)
}

function previewRequest(authorization?: string, path = "/ja"): Request {
  const headers = new Headers()
  if (authorization) headers.set("authorization", authorization)
  return new Request(`http://payload.local/next/preview?path=${encodeURIComponent(path)}`, {
    headers,
  })
}

async function expectRejected(authorization?: string): Promise<void> {
  const response = await GET(previewRequest(authorization))
  expect(response.status).toBe(401)
  expect(await response.text()).toBe("Unauthorized")
  expect(nextMocks.enableDraftMode).not.toHaveBeenCalled()
  expect(nextMocks.redirect).not.toHaveBeenCalled()
}

describe("preview route authorization", () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })

    await createSession("admin")
    await createSession("editor")
    await createSession("serviceAdmin")

    const adminId = userIds[0]
    if (!adminId) throw new Error("MCP API Key用の管理者を作成できませんでした")
    activeMcpApiKey = `preview-mcp-active-${crypto.randomUUID()}`
    expiredMcpApiKey = `preview-mcp-expired-${crypto.randomUUID()}`
    for (const [apiKey, expiresAt] of [
      [activeMcpApiKey, new Date(Date.now() + 60_000).toISOString()],
      [expiredMcpApiKey, new Date(Date.now() - 60_000).toISOString()],
    ] as const) {
      const key = await payload.create({
        collection: "payload-mcp-api-keys",
        data: {
          user: adminId,
          label: "Preview route integration test",
          enableAPIKey: true,
          apiKey,
          expiresAt,
          news: { find: true, create: false, update: false },
        },
      })
      mcpKeyIds.push(key.id)
    }
  })

  beforeEach(() => {
    nextMocks.enableDraftMode.mockClear()
    nextMocks.redirect.mockClear()
  })

  afterAll(async () => {
    for (const id of mcpKeyIds) {
      await payload.delete({ collection: "payload-mcp-api-keys", id })
    }
    for (const id of userIds) {
      await payload.delete({ collection: "users", id })
    }
  })

  for (const role of ["admin", "editor", "serviceAdmin"] as const) {
    it(`${role} の通常ログインセッションはDraft Modeを有効化できる`, async () => {
      const token = sessionTokens.get(role)
      expect(token).toBeDefined()

      await expect(GET(previewRequest(`JWT ${token}`))).rejects.toThrow("redirect:/ja")
      expect(nextMocks.enableDraftMode).toHaveBeenCalledOnce()
      expect(nextMocks.redirect).toHaveBeenCalledWith("/ja")
    })
  }

  it("未認証リクエストを拒否しDraft Modeを変更しない", async () => {
    await expectRejected()
  })

  it("有効なMCP API Keyでも拒否しDraft Modeを変更しない", async () => {
    await expectRejected(`payload-mcp-api-keys API-Key ${activeMcpApiKey}`)
  })

  it("期限切れMCP API Keyを拒否しDraft Modeを変更しない", async () => {
    await expectRejected(`payload-mcp-api-keys API-Key ${expiredMcpApiKey}`)
  })

  it("Users API Keyを拒否しDraft Modeを変更しない", async () => {
    await expectRejected(`users API-Key ${usersApiKey}`)
  })

  it("許可されたセッションでも外部リダイレクト形式をルートへ丸める", async () => {
    const token = sessionTokens.get("admin")
    await expect(GET(previewRequest(`JWT ${token}`, "//example.com"))).rejects.toThrow("redirect:/")
    expect(nextMocks.enableDraftMode).toHaveBeenCalledOnce()
    expect(nextMocks.redirect).toHaveBeenCalledWith("/")
  })
})
