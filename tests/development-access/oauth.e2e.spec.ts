import { createHash, randomBytes } from "node:crypto"
import { expect, test, type APIRequestContext } from "@playwright/test"
import { z } from "zod"

import { serviceAdminUser } from "../helpers/seed-user"

const origin = "https://localhost:3000"
const resource = `${origin}/mcp`
// テスト用callbackは404でもURLからcodeを受け取れる。
const callback = `${origin}/oauth/client-callback`
const credentials = {
  username: "basic-e2e",
  password: "basic-e2e-password",
  send: "always" as const,
}
const tokensSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  scope: z.string(),
})

test("consent rejects altered redirects and permits denial or read-only access", async ({
  playwright,
  request,
}) => {
  const cms = await playwright.request.newContext({
    ignoreHTTPSErrors: true,
    httpCredentials: credentials,
  })
  try {
    expect((await cms.post(`${origin}/api/users/login/`, { data: serviceAdminUser })).ok()).toBe(
      true,
    )
    const clientId = await register(request)
    const verifier = randomBytes(32).toString("base64url")
    const authURL = authorizeURL(clientId, verifier)
    const altered = new URL(authURL)
    altered.searchParams.set("redirect_uri", "https://attacker.example/callback")
    expect((await cms.get(altered.href, { maxRedirects: 0 })).status()).toBe(400)
    const html = await (await cms.get(authURL)).text()
    const nonce = html.match(/name="csrf" value="([^"]+)"/)?.[1] ?? ""
    const crossOrigin = await cms.post(authURL, {
      headers: { origin: "https://attacker.example" },
      form: { csrf: nonce, decision: "allow", write: "yes" },
      maxRedirects: 0,
    })
    expect(crossOrigin.status()).toBe(403)
    const denied = await cms.post(authURL, {
      headers: { origin },
      form: { csrf: nonce, decision: "deny" },
      maxRedirects: 0,
    })
    expect(denied.status()).toBe(303)
    expect(new URL(denied.headers().location).searchParams.get("error")).toBe("access_denied")
    expect(new URL(denied.headers().location).searchParams.has("code")).toBe(false)
    const fresh = await (await cms.get(authURL)).text()
    const allowed = await cms.post(authURL, {
      headers: { origin },
      form: { csrf: fresh.match(/name="csrf" value="([^"]+)"/)?.[1] ?? "", decision: "allow" },
      maxRedirects: 0,
    })
    expect(allowed.status()).toBe(303)
    const code = new URL(allowed.headers().location).searchParams.get("code") ?? ""
    const response = await request.post("/oauth/token", {
      form: {
        grant_type: "authorization_code",
        client_id: clientId,
        redirect_uri: callback,
        resource,
        code,
        code_verifier: verifier,
      },
    })
    expect(response.status()).toBe(200)
    const tokens = tokensSchema.parse(await response.json())
    expect(tokens.scope.split(" ")).not.toContain("mcp:write")
    const listed = z
      .object({ tools: z.array(z.object({ name: z.string() })) })
      .parse(await invoke(request, tokens.access_token, "tools/list", {}))
    expect(listed.tools.every((tool) => tool.name.startsWith("find"))).toBe(true)
    // RFC 7009 revocation: 接続元からもrefresh tokenを失効できる。
    expect(
      (
        await request.post("/oauth/token", {
          form: {
            client_id: clientId,
            token: tokens.refresh_token,
            token_type_hint: "refresh_token",
          },
        })
      ).status(),
    ).toBe(200)
  } finally {
    await cms.dispose()
  }
})

async function register(request: APIRequestContext) {
  const registered = await request.post(`${origin}/oauth/register`, {
    data: {
      client_name: "OAuth E2E client",
      redirect_uris: [callback],
      token_endpoint_auth_method: "none",
      grant_types: ["authorization_code", "refresh_token"],
      response_types: ["code"],
    },
  })
  expect(registered.status(), await registered.text()).toBe(201)
  return z.object({ client_id: z.string() }).parse(await registered.json()).client_id
}

function authorizeURL(clientId: string, verifier: string) {
  const url = new URL(`${origin}/oauth/authorize`)
  url.search = new URLSearchParams({
    client_id: clientId,
    redirect_uri: callback,
    response_type: "code",
    state: "state-e2e",
    code_challenge: createHash("sha256").update(verifier).digest("base64url"),
    code_challenge_method: "S256",
    scope: "mcp:read mcp:write offline_access",
    resource,
  }).toString()
  return url.href
}

async function invoke(
  request: APIRequestContext,
  token: string,
  method: string,
  params: Record<string, unknown>,
) {
  const response = await request.post(resource, {
    headers: { authorization: `Bearer ${token}`, accept: "application/json, text/event-stream" },
    data: { jsonrpc: "2.0", id: 1, method, params },
  })
  const body = await response.text()
  expect(response.status(), body).toBe(200)
  const event = body.split("\n").find((line) => line.startsWith("data: "))
  return z
    .object({ result: z.record(z.string(), z.unknown()) })
    .parse(JSON.parse(event ? event.slice(6) : body)).result
}

test("OAuth discovery is public while CMS, consent and ordinary API still require Basic", async ({
  request,
}) => {
  for (const path of ["/mcp", "/mcp/"]) {
    const response = await request.post(path, {
      data: { jsonrpc: "2.0", id: 1, method: "tools/list" },
    })
    expect(response.status()).toBe(401)
    expect(response.headers()["www-authenticate"]).toContain("Bearer")
    expect(response.headers()["www-authenticate"]).toContain("resource_metadata=")
  }
  for (const path of [
    "/.well-known/oauth-protected-resource/mcp",
    "/.well-known/oauth-protected-resource/mcp/",
  ]) {
    const response = await request.get(path)
    expect(response.status()).toBe(200)
    expect(await response.json()).toMatchObject({
      resource,
      scopes_supported: ["mcp:read", "mcp:write"],
    })
  }
  const metadata = await request.get("/.well-known/oauth-authorization-server")
  expect(await metadata.json()).toMatchObject({
    issuer: origin,
    authorization_endpoint: `${origin}/oauth/authorize/`,
    code_challenge_methods_supported: ["S256"],
    client_id_metadata_document_supported: true,
    authorization_response_iss_parameter_supported: true,
  })
  for (const path of [
    "/admin/",
    "/api/news/",
    "/api/mcp/",
    "/oauth/authorize/",
    "/oauth/connections/",
    "/mcp/other",
    "/oauth/register/other",
  ]) {
    const response = await request.get(path)
    expect(response.status()).toBe(401)
    expect(response.headers()["www-authenticate"]).toContain("Basic")
  }
})

test("OAuth consent, PKCE, content update, scope reduction and revocation work behind Basic", async ({
  browser,
  playwright,
  request,
}) => {
  const clientId = await register(request)
  const verifier = randomBytes(32).toString("base64url")
  const authURL = authorizeURL(clientId, verifier)
  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
    httpCredentials: credentials,
  })
  const page = await context.newPage()
  const cms = context.request
  const marker = `oauth-e2e-${crypto.randomUUID()}`
  const docsURL = `${origin}/api/news/?where[slug][equals]=${marker}&draft=true`
  try {
    // OAuthのログイン画面からCMSへ移動し、元の同意画面へ戻る。
    await page.goto(authURL)
    await expect(page).toHaveURL(/\/admin\/login\/?\?redirect=/)
    await page.getByLabel("メールアドレス").fill(serviceAdminUser.email)
    await page.getByLabel("パスワード", { exact: true }).fill(serviceAdminUser.password)
    await page.getByRole("button", { name: "ログイン", exact: true }).click()
    await expect(page.getByRole("heading", { name: "AIからの接続を許可" })).toBeVisible()
    await expect(page.getByText(serviceAdminUser.email, { exact: false })).toBeVisible()
    const forged = await cms.post(authURL, {
      form: { decision: "allow", write: "yes", csrf: "forged" },
      headers: { origin },
    })
    expect(forged.status()).toBe(403)
    await page.getByLabel("登録・更新・公開状態の変更も許可する").check()
    await page.getByRole("button", { name: "接続を許可", exact: true }).click()
    await expect(page).toHaveURL(/^https:\/\/localhost:3000\/oauth\/client-callback\/?\?/)
    const callbackURL = new URL(page.url())
    expect(callbackURL.searchParams.get("state")).toBe("state-e2e")
    expect(callbackURL.searchParams.get("iss")).toBe(origin)
    const code = callbackURL.searchParams.get("code") ?? ""
    const exchange = {
      grant_type: "authorization_code",
      client_id: clientId,
      redirect_uri: callback,
      resource,
      code,
      code_verifier: verifier,
    }
    const wrongVerifier = await request.post("/oauth/token", {
      form: { ...exchange, code_verifier: randomBytes(32).toString("base64url") },
    })
    expect(wrongVerifier.status()).toBe(400)
    const issued = await request.post("/oauth/token", { form: exchange })
    expect(issued.status(), await issued.text()).toBe(200)
    const tokens = tokensSchema.parse(await issued.json())
    const initialized = await invoke(request, tokens.access_token, "initialize", {
      protocolVersion: "2025-03-26",
      capabilities: {},
      clientInfo: { name: "oauth-e2e", version: "1" },
    })
    expect(initialized).toHaveProperty("serverInfo")
    await invoke(request, tokens.access_token, "tools/call", {
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
    const documents = z.object({
      docs: z.array(z.object({ id: z.number(), title: z.string(), _status: z.string() })),
    })
    const created = documents.parse(await (await cms.get(docsURL)).json())
    expect(created.docs).toHaveLength(1)
    await invoke(request, tokens.access_token, "tools/call", {
      name: "updateNews",
      arguments: { id: created.docs[0].id, title: `${marker} updated`, draft: true },
    })
    expect(documents.parse(await (await cms.get(docsURL)).json()).docs[0]).toMatchObject({
      title: `${marker} updated`,
      _status: "draft",
    })
    const anonymous = await playwright.request.newContext({
      ignoreHTTPSErrors: true,
      httpCredentials: credentials,
    })
    try {
      expect(documents.parse(await (await anonymous.get(docsURL)).json()).docs).toHaveLength(0)
    } finally {
      await anonymous.dispose()
    }
    // Payload RESTへOAuth tokenを流しても、通常APIの認証主体にはならない。
    const restIdentity = await cms.get(`${origin}/api/users/me/`, {
      headers: { "X-IntaCMS-Authorization": `Bearer ${tokens.access_token}`, Cookie: "" },
    })
    expect(await restIdentity.json()).toMatchObject({ user: null })
    const wrongResource = await request.post("/oauth/token", {
      form: {
        grant_type: "refresh_token",
        client_id: clientId,
        refresh_token: tokens.refresh_token,
        resource: `${origin}/api`,
      },
    })
    expect(wrongResource.status()).toBe(400)
    const refreshed = await request.post("/oauth/token", {
      form: {
        grant_type: "refresh_token",
        client_id: clientId,
        refresh_token: tokens.refresh_token,
        resource,
        scope: "mcp:read",
      },
    })
    expect(refreshed.status(), await refreshed.text()).toBe(200)
    const readTokens = tokensSchema.parse(await refreshed.json())
    expect(readTokens.scope).toBe("mcp:read")
    const listed = z
      .object({ tools: z.array(z.object({ name: z.string() })) })
      .parse(await invoke(request, readTokens.access_token, "tools/list", {}))
    expect(listed.tools.length).toBeGreaterThan(0)
    expect(listed.tools.every((tool) => tool.name.startsWith("find"))).toBe(true)
    await page.goto(`${origin}/oauth/connections/`)
    await expect(page.getByRole("heading", { name: "AI接続の管理" })).toBeVisible()
    await page.getByRole("button", { name: "接続を解除" }).first().click()
    await expect(page.getByText("許可した接続はありません。")).toBeVisible()
    expect(
      (
        await request.post(resource, {
          headers: { authorization: `Bearer ${readTokens.access_token}` },
        })
      ).status(),
    ).toBe(401)
    expect(
      (
        await request.post("/oauth/token", {
          form: {
            grant_type: "refresh_token",
            client_id: clientId,
            refresh_token: readTokens.refresh_token,
            resource,
          },
        })
      ).status(),
    ).toBe(400)
    expect((await request.post("/oauth/token", { form: exchange })).status()).toBe(400)
  } finally {
    const cleanup = z
      .object({ docs: z.array(z.object({ id: z.number() })) })
      .safeParse(await (await cms.get(docsURL)).json())
    if (cleanup.success)
      for (const doc of cleanup.data.docs) await cms.delete(`${origin}/api/news/${doc.id}/`)
    await context.close()
  }
})
