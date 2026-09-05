import { afterEach, describe, expect, test, vi } from "vite-plus/test"

import { verifyTurnstileToken } from "@/core/frontend/forms/verify-turnstile-token"

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

describe("Turnstileの安全な失敗", () => {
  test("本番ではローカル省略フラグがあっても秘密鍵未設定を拒否する", async () => {
    vi.stubEnv("NODE_ENV", "production")
    vi.stubEnv("TURNSTILE_SECRET_KEY", "")
    vi.stubEnv("TURNSTILE_ALLOW_INSECURE_LOCAL", "true")
    expect(await verifyTurnstileToken("")).toBe(false)
  })

  test("開発時も省略は明示設定がある場合だけ", async () => {
    vi.stubEnv("NODE_ENV", "development")
    vi.stubEnv("TURNSTILE_SECRET_KEY", "")
    vi.stubEnv("TURNSTILE_ALLOW_INSECURE_LOCAL", "")
    expect(await verifyTurnstileToken("")).toBe(false)
    vi.stubEnv("TURNSTILE_ALLOW_INSECURE_LOCAL", "true")
    expect(await verifyTurnstileToken("")).toBe(true)
  })

  test("空・長すぎるトークンは外部検証前に拒否する", async () => {
    vi.stubEnv("TURNSTILE_SECRET_KEY", "synthetic-test-secret")
    const fetch = vi.fn()
    vi.stubGlobal("fetch", fetch)
    expect(await verifyTurnstileToken("")).toBe(false)
    expect(await verifyTurnstileToken("a".repeat(2049))).toBe(false)
    expect(fetch).not.toHaveBeenCalled()
  })

  test("正しい応答だけを受け入れ、障害・不正JSON・型の不一致は拒否する", async () => {
    vi.stubEnv("TURNSTILE_SECRET_KEY", "synthetic-test-secret")
    const fetch = vi.fn()
    vi.stubGlobal("fetch", fetch)
    for (const response of [
      Response.json({ success: false }),
      Response.json({ success: "true" }),
      Response.json({ success: true }, { status: 503 }),
      new Response("invalid JSON"),
    ]) {
      fetch.mockResolvedValueOnce(response)
      expect(await verifyTurnstileToken("synthetic-token")).toBe(false)
    }
    fetch.mockRejectedValueOnce(new Error("timeout"))
    expect(await verifyTurnstileToken("synthetic-token")).toBe(false)
    fetch.mockResolvedValueOnce(Response.json({ success: true }))
    expect(await verifyTurnstileToken("synthetic-token")).toBe(true)
    expect(fetch.mock.lastCall?.[1].signal).toBeInstanceOf(AbortSignal)
  })
})
