import { getPayload, type Payload } from "payload"
import { afterAll, beforeAll, beforeEach, describe, expect, test, vi } from "vite-plus/test"

import config from "@/payload.config"
import type { User } from "@/payload-types"
import { GET as preview } from "@/app/(frontend)/next/preview/route"
import { GET as exitPreview } from "@/app/(frontend)/next/exit-preview/route"
import { getFrontendAccess } from "@/core/lib/preview/get-frontend-access"
import { toSafePreviewPath } from "@/core/lib/preview/to-safe-preview-path"

const state = vi.hoisted(() => ({
  draft: { isEnabled: false, enable: vi.fn(), disable: vi.fn() },
  headers: new Headers(),
  redirect: vi.fn((path: string) => {
    throw new Error(`REDIRECT:${path}`)
  }),
}))
vi.mock("next/headers", () => ({
  draftMode: async () => state.draft,
  headers: async () => state.headers,
}))
vi.mock("next/navigation", () => ({ redirect: state.redirect }))

let payload: Payload
let editor: User
const userKey = crypto.randomUUID()
const password = crypto.randomUUID()
let sessionToken: string
const mcpKeys: string[] = []
const mcpIds: number[] = []

describe("プレビューの認証とリダイレクト", () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
    editor = await payload.create({
      collection: "users",
      data: {
        email: `preview-security-${crypto.randomUUID()}@example.com`,
        password,
        roles: ["editor"],
        enableAPIKey: true,
        apiKey: userKey,
      },
    })
    const login = await payload.login({
      collection: "users",
      data: { email: editor.email, password },
    })
    if (!login.token) throw new Error("Missing fixture session")
    sessionToken = login.token
    for (const expiresAt of [new Date(Date.now() - 60000), new Date(Date.now() + 60000)]) {
      const apiKey = crypto.randomUUID()
      const key = await payload.create({
        collection: "payload-mcp-api-keys",
        data: {
          user: editor.id,
          label: "Preview security test",
          enableAPIKey: true,
          apiKey,
          expiresAt: expiresAt.toISOString(),
        },
      })
      mcpKeys.push(apiKey)
      mcpIds.push(key.id)
    }
  })

  beforeEach(() => {
    vi.clearAllMocks()
    state.headers = new Headers()
    state.draft.isEnabled = false
  })

  afterAll(async () => {
    for (const id of mcpIds) await payload.delete({ collection: "payload-mcp-api-keys", id })
    if (editor) await payload.delete({ collection: "users", id: editor.id })
  })

  test("未認証・期限切れMCP・有効MCPのいずれもプレビューCookieを発行しない", async () => {
    for (const key of [undefined, ...mcpKeys]) {
      const headers = new Headers()
      if (key) headers.set("authorization", `payload-mcp-api-keys API-Key ${key}`)
      const response = await preview(
        new Request("http://127.0.0.1:3000/next/preview?path=/", { headers }),
      )
      expect(response.status).toBe(401)
    }
    expect(state.draft.enable).not.toHaveBeenCalled()
  })

  test("Usersの編集者はプレビューできる", async () => {
    state.headers.set("authorization", `JWT ${sessionToken}`)
    await expect(
      preview(
        new Request("http://127.0.0.1:3000/next/preview?path=/en/news", {
          headers: state.headers,
        }),
      ),
    ).rejects.toThrow("REDIRECT:/en/news")
    expect(state.draft.enable).toHaveBeenCalledOnce()
    state.draft.isEnabled = true
    const access = await getFrontendAccess()
    expect(access.draft).toBe(true)
    expect(access.user?.id).toBe(editor.id)
    expect(access.overrideAccess).toBe(false)
  })

  test("Users API KeyはCookieがあっても下書きを読めない", async () => {
    state.draft.isEnabled = true
    state.headers.set("authorization", `users API-Key ${userKey}`)
    expect(await getFrontendAccess()).toEqual({ draft: false, user: null, overrideAccess: false })
  })

  test("残存Cookieだけでは下書きを読めず、認証を失った後は公開表示へ戻る", async () => {
    state.draft.isEnabled = true
    state.headers.set("authorization", `JWT ${sessionToken}`)
    expect((await getFrontendAccess()).draft).toBe(true)
    state.headers = new Headers()
    expect(await getFrontendAccess()).toEqual({ draft: false, user: null, overrideAccess: false })
    state.headers.set("authorization", `payload-mcp-api-keys API-Key ${mcpKeys[0]}`)
    expect(await getFrontendAccess()).toEqual({ draft: false, user: null, overrideAccess: false })
  })

  test.each([
    "//invalid.example",
    "/\t/invalid.example",
    "/\n/invalid.example",
    "/\\invalid.example",
    "/.//invalid.example",
    "/x/..//invalid.example",
    "/%2e//invalid.example",
    "/\u0000/invalid.example",
    "https://invalid.example",
    "javascript:alert(1)",
  ])("外部URLへ解釈される入力を拒否する: %j", (path) => {
    expect(toSafePreviewPath(path)).toBe("/")
  })

  test("安全なローカライズパス・クエリ・アンカーを維持する", () => {
    expect(toSafePreviewPath("/en/news/example?filter=a%20b#article")).toBe(
      "/en/news/example?filter=a%20b#article",
    )
    expect(toSafePreviewPath(null)).toBe("/")
  })

  test("exit-previewでも同じ検証を通し、外部リダイレクトを返さない", async () => {
    await expect(
      exitPreview(new Request("http://127.0.0.1:3000/next/exit-preview?path=/%09/invalid.example")),
    ).rejects.toThrow("REDIRECT:/")
    expect(state.draft.disable).toHaveBeenCalledOnce()
  })
})
