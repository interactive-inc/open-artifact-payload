import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { createServer } from "node:http"

import { afterEach, describe, expect, test, vi } from "vite-plus/test"

import { createCliFetchPort } from "./create-cli-fetch-port"
import { runCli } from "./run-cli"

const directories: string[] = []
const stagingEndpoint = "https://staging.example.com"
const productionEndpoint = "https://example.com"
const basicAuthorization = `Basic ${Buffer.from("dev:secret:password").toString("base64")}`

afterEach(async () => {
  await Promise.all(
    directories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })),
  )
})

async function createEnvironment() {
  const directory = await mkdtemp(join(tmpdir(), "intacms-basic-"))
  directories.push(directory)
  return {
    INTACMS_CONFIG_DIR: directory,
    INTACMS_STAGING_ENDPOINT: stagingEndpoint,
    INTACMS_PROD_ENDPOINT: productionEndpoint,
    INTACMS_STAGING_BASIC_AUTH_USERNAME: "dev",
    INTACMS_STAGING_BASIC_AUTH_PASSWORD: "secret:password",
  }
}

describe("CLI Basic authentication", () => {
  test("uses Basic on login, JWT requests, re-login revocation and logout", async () => {
    const env = await createEnvironment()
    const requests: Array<{ path: string; cms: string | null }> = []
    const fetchPort = vi.fn(async (input: RequestInfo | URL, init: RequestInit) => {
      const url = new URL(input instanceof Request ? input.url : String(input))
      const headers = new Headers(init.headers)
      expect(headers.get("authorization")).toBe(basicAuthorization)
      expect(init.redirect).toBe("error")
      requests.push({ path: url.pathname, cms: headers.get("x-intacms-authorization") })
      if (url.pathname === "/api/users/login/") {
        expect(JSON.parse(typeof init.body === "string" ? init.body : "null")).toEqual({
          email: "admin@example.com",
          password: "cms-password",
        })
        return Response.json({ token: "cms-session", user: { email: "admin@example.com" } })
      }
      return Response.json({ docs: [], user: { email: "admin@example.com" } })
    })
    const io = { writeOutput: vi.fn(), writeError: vi.fn(), readSecret: async () => "cms-password" }
    for (const argv of [
      ["login", "--staging", "--email", "admin@example.com"],
      ["news", "--staging"],
      ["whoami", "--staging"],
      ["login", "--staging", "--email", "admin@example.com"],
      ["logout", "--staging"],
    ]) {
      expect(await runCli({ argv, env, fetchPort, io })).toBe(0)
    }
    expect(requests).toEqual([
      { path: "/api/users/login/", cms: null },
      { path: "/api/news/", cms: "JWT cms-session" },
      { path: "/api/users/me/", cms: "JWT cms-session" },
      { path: "/api/users/login/", cms: null },
      { path: "/api/users/logout/", cms: "JWT cms-session" },
      { path: "/api/users/logout/", cms: "JWT cms-session" },
    ])
    expect(io.writeError).not.toHaveBeenCalled()
    expect(JSON.stringify(io.writeOutput.mock.calls)).not.toContain("cms-session")
    expect(JSON.stringify(io.writeOutput.mock.calls)).not.toContain("secret:password")
  })

  test("switches staging and production without sending staging Basic credentials to production", async () => {
    const env = { ...(await createEnvironment()), OPEN_ARTIFACT_API_KEY: "cms-key" }
    const requests: Array<{ url: string; basic: string | null; cms: string | null }> = []
    const fetchPort = vi.fn(async (input: RequestInfo | URL, init: RequestInit) => {
      const headers = new Headers(init.headers)
      requests.push({
        url: input instanceof Request ? input.url : String(input),
        basic: headers.get("authorization"),
        cms: headers.get("x-intacms-authorization"),
      })
      return Response.json({ docs: [] })
    })
    for (const environment of ["--staging", "--prod"]) {
      expect(
        await runCli({
          argv: ["news", environment],
          env,
          fetchPort,
          io: { writeOutput: vi.fn(), writeError: vi.fn(), readSecret: vi.fn() },
        }),
      ).toBe(0)
    }
    expect(requests[0]).toMatchObject({ basic: basicAuthorization, cms: "users API-Key cms-key" })
    expect(requests[0]?.url).toContain(stagingEndpoint)
    expect(requests[1]).toMatchObject({ basic: "users API-Key cms-key", cms: null })
    expect(requests[1]?.url).toContain(`${productionEndpoint}/api/`)
  })

  test.each([
    { INTACMS_STAGING_BASIC_AUTH_PASSWORD: undefined },
    { INTACMS_STAGING_BASIC_AUTH_USERNAME: "bad:name" },
    {
      OPEN_ARTIFACT_ENDPOINT: "https://different.example.com",
      INTACMS_PROD_ENDPOINT: "https://different.example.com",
      INTACMS_PROD_BASIC_AUTH_USERNAME: "dev",
      INTACMS_PROD_BASIC_AUTH_PASSWORD: "secret",
    },
    { INTACMS_STAGING_ENDPOINT: "http://localhost:3000" },
  ])(
    "rejects unsafe or incomplete Basic configuration before requesting a CMS password: %j",
    async (override) => {
      const env = { ...(await createEnvironment()), ...override }
      // Keep production locking out of the legacy-override test to reach the credential binding check.
      if (override.OPEN_ARTIFACT_ENDPOINT) env.INTACMS_PROD_ENDPOINT = productionEndpoint
      const fetchPort = vi.fn()
      const io = { writeOutput: vi.fn(), writeError: vi.fn(), readSecret: vi.fn() }
      const argv = [
        "login",
        override.OPEN_ARTIFACT_ENDPOINT ? "--prod" : "--staging",
        "--email",
        "admin@example.com",
      ]
      expect(await runCli({ argv, env, fetchPort, io })).toBe(1)
      expect(fetchPort).not.toHaveBeenCalled()
      expect(io.readSecret).not.toHaveBeenCalled()
      expect(io.writeError).toHaveBeenCalled()
    },
  )

  test("refuses off-target requests and forbids automatic redirects carrying the custom credential", async () => {
    const fetchPort = vi.fn(
      async () =>
        new Response(null, { status: 307, headers: { location: "https://other.example.com" } }),
    )
    const fetchWithBasic = createCliFetchPort({
      endpoint: stagingEndpoint,
      basicAuthorization,
      fetchPort,
    })
    for (const url of ["https://other.example.com/api/news/", `${stagingEndpoint}/admin/`]) {
      expect((await fetchWithBasic(url, {})).status).toBe(400)
    }
    expect(fetchPort).not.toHaveBeenCalled()
    await fetchWithBasic(`${stagingEndpoint}/api/news`, { headers: { authorization: "JWT token" } })
    expect(fetchPort).toHaveBeenCalledOnce()
    expect(fetchPort).toHaveBeenCalledWith(
      new URL(`${stagingEndpoint}/api/news/`),
      expect.objectContaining({ redirect: "error" }),
    )
  })

  test("native fetch never follows a redirect with CMS credentials", async () => {
    const paths: string[] = []
    const server = createServer((request, response) => {
      paths.push(request.url ?? "")
      response.writeHead(307, { location: "/credential-sink/" })
      response.end()
    })
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve))
    const address = server.address()
    if (address === null || typeof address === "string") throw new Error("Missing test port")
    const endpoint = `http://127.0.0.1:${address.port}`
    const fetchWithBasic = createCliFetchPort({ endpoint, basicAuthorization, fetchPort: fetch })
    try {
      await expect(
        fetchWithBasic(`${endpoint}/api/news`, { headers: { authorization: "JWT fixture" } }),
      ).rejects.toThrow()
      expect(paths).toEqual(["/api/news/"])
    } finally {
      server.closeAllConnections()
      await new Promise<void>((resolve) => server.close(() => resolve()))
    }
  })

  test("reports a Basic failure during logout instead of claiming the server session was revoked", async () => {
    const env = await createEnvironment()
    const io = { writeOutput: vi.fn(), writeError: vi.fn(), readSecret: async () => "password" }
    const fetchPort = vi.fn(async (input: RequestInfo | URL) => {
      const url = input instanceof Request ? input.url : String(input)
      if (url.endsWith("/login/"))
        return Response.json({ token: "session", user: { email: "admin@example.com" } })
      return new Response("Authentication required", {
        status: 401,
        headers: { "WWW-Authenticate": 'Basic realm="development"' },
      })
    })
    expect(
      await runCli({
        argv: ["login", "--staging", "--email", "admin@example.com"],
        env,
        io,
        fetchPort,
      }),
    ).toBe(0)
    expect(await runCli({ argv: ["logout", "--staging"], env, io, fetchPort })).toBe(1)
    expect(io.writeError).toHaveBeenCalledWith(
      expect.stringContaining("server logout failed: Development Basic authentication failed"),
    )
  })
})
