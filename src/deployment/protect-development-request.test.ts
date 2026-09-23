import { describe, expect, it, vi } from "vite-plus/test"

import { protectDevelopmentRequest } from "@/deployment/protect-development-request"
import { isMcpOAuthMachinePath } from "@/deployment/mcp-oauth-paths"

const credentials = { enabled: true, username: "inta", password: "test:password" }
const authorization = `Basic ${Buffer.from("inta:test:password").toString("base64")}`

describe("development access", () => {
  it("preserves OAuth bearer only on the exact machine endpoints and discards alternate headers", async () => {
    const serve = vi.fn(async (request: Request) => {
      expect(request.headers.get("authorization")).toBe("Bearer oauth-token")
      expect(request.headers.get("x-intacms-authorization")).toBeNull()
      return new Response("ok")
    })
    await protectDevelopmentRequest(
      new Request("https://example.com/mcp", {
        headers: {
          authorization: "Bearer oauth-token",
          "x-intacms-authorization": "Bearer forged",
        },
      }),
      { ...credentials, bypassBasicAuth: isMcpOAuthMachinePath("/mcp"), serve },
    )
    expect(serve).toHaveBeenCalledOnce()
    for (const path of [
      "/api/mcp/",
      "/oauth/authorize/",
      "/oauth/connections/",
      "/mcp/other",
      "/oauth/register/other",
    ]) {
      expect(isMcpOAuthMachinePath(path)).toBe(false)
    }
  })
  it("redirects HTTP before issuing a Basic challenge and preserves the path and query", async () => {
    const serve = vi.fn()
    const response = await protectDevelopmentRequest(
      new Request("http://example.com/admin/?next=edit"),
      { ...credentials, serve },
    )
    expect(response.status).toBe(308)
    expect(response.headers.get("location")).toBe("https://example.com/admin/?next=edit")
    expect(response.headers.get("www-authenticate")).toBeNull()
    expect(serve).not.toHaveBeenCalled()
  })

  it.each(["/", "/admin/", "/api/media/file/test.jpg", "/_next/static/test.js", "/robots.txt"])(
    "protects %s before the application or assets are reached",
    async (path) => {
      const serve = vi.fn()
      const response = await protectDevelopmentRequest(new Request(`https://example.com${path}`), {
        ...credentials,
        serve,
      })
      expect(response.status).toBe(401)
      expect(response.headers.get("www-authenticate")).toContain("Basic")
      expect(response.headers.get("cache-control")).toContain("no-store")
      expect(serve).not.toHaveBeenCalled()
    },
  )

  it.each(["Basic !!!", "Bearer token", "Basic d3Jvbmc=", "basic ", authorization + "extra"])(
    "rejects malformed and incorrect credentials: %s",
    async (header) => {
      const serve = vi.fn()
      const response = await protectDevelopmentRequest(
        new Request("https://example.com", { headers: { authorization: header } }),
        { ...credentials, serve },
      )
      expect(response.status).toBe(401)
      expect(serve).not.toHaveBeenCalled()
    },
  )

  it.each([{ username: null }, { password: null }, { password: "" }, { username: "bad:name" }])(
    "fails closed for incomplete configuration %j",
    async (missing) => {
      const serve = vi.fn()
      const response = await protectDevelopmentRequest(new Request("https://example.com"), {
        ...credentials,
        ...missing,
        serve,
      })
      expect(response.status).toBe(503)
      expect(serve).not.toHaveBeenCalled()
    },
  )

  it("preserves POST bodies and CMS cookies, strips Basic, and protects cached responses", async () => {
    const serve = vi.fn(async (request: Request) => {
      expect(request.headers.get("authorization")).toBeNull()
      expect(request.headers.get("cookie")).toBe("payload-token=cms-session")
      expect(await request.text()).toBe("form=value")
      return new Response("application", {
        headers: {
          "Cache-Control": "public, max-age=3600",
          "Set-Cookie": "payload-token=new-session; HttpOnly",
        },
      })
    })
    const request = new Request("https://example.com/api/", {
      method: "POST",
      body: "form=value",
      headers: { authorization, cookie: "payload-token=cms-session" },
    })
    const response = await protectDevelopmentRequest(request, { ...credentials, serve })
    expect(await response.text()).toBe("application")
    expect(response.headers.get("cache-control")).toBe("private, no-store")
    expect(response.headers.get("x-robots-tag")).toContain("noindex")
    expect(response.headers.get("set-cookie")).toContain("HttpOnly")
  })

  it("leaves the application authentication intact when disabled", async () => {
    const serve = vi.fn(
      async (request: Request) => new Response(request.headers.get("authorization")),
    )
    const response = await protectDevelopmentRequest(
      new Request("https://example.com", { headers: { authorization: "Bearer cms-key" } }),
      { ...credentials, enabled: false, serve },
    )
    expect(await response.text()).toBe("Bearer cms-key")
    expect(response.headers.get("x-robots-tag")).toBeNull()
  })

  it.each(["Bearer mcp-key", "JWT cms-session", "users API-Key cms-key"])(
    "forwards %s only after successful Basic authentication",
    async (cmsAuthorization) => {
      const serve = vi.fn(async (request: Request) => {
        expect(request.headers.get("authorization")).toBe(cmsAuthorization)
        expect(request.headers.get("x-intacms-authorization")).toBeNull()
        expect(await request.text()).toBe('{"title":"draft"}')
        return Response.json({ ok: true })
      })
      const response = await protectDevelopmentRequest(
        new Request("https://example.com/api/mcp/", {
          method: "POST",
          body: '{"title":"draft"}',
          headers: { authorization, "X-IntaCMS-Authorization": cmsAuthorization },
        }),
        { ...credentials, serve },
      )
      expect(response.status).toBe(200)
      expect(serve).toHaveBeenCalledOnce()
    },
  )

  it.each([undefined, "Bearer cms-key", "Basic d3Jvbmc="])(
    "does not let a CMS credential bypass missing or invalid Basic: %s",
    async (basic) => {
      const serve = vi.fn()
      const headers = new Headers({ "X-IntaCMS-Authorization": "Bearer cms-key" })
      if (basic) headers.set("authorization", basic)
      const response = await protectDevelopmentRequest(
        new Request("https://example.com/api/mcp/", { headers }),
        { ...credentials, serve },
      )
      expect(response.status).toBe(401)
      expect(serve).not.toHaveBeenCalled()
    },
  )

  it.each(["/admin/", "/_next/static/app.js", "/api-not-a-route/"])(
    "never forwards the alternate CMS credential to %s",
    async (path) => {
      const serve = vi.fn(async (request: Request) => {
        expect(request.headers.get("authorization")).toBeNull()
        expect(request.headers.get("x-intacms-authorization")).toBeNull()
        return new Response("ok")
      })
      await protectDevelopmentRequest(
        new Request(`https://example.com${path}`, {
          headers: { authorization, "X-IntaCMS-Authorization": "Bearer cms-key" },
        }),
        { ...credentials, serve },
      )
      expect(serve).toHaveBeenCalledOnce()
    },
  )

  it("ignores and removes the alternate CMS credential when Basic is disabled", async () => {
    const serve = vi.fn(async (request: Request) => {
      expect(request.headers.get("authorization")).toBe("Bearer production-key")
      expect(request.headers.get("x-intacms-authorization")).toBeNull()
      return new Response("ok")
    })
    await protectDevelopmentRequest(
      new Request("https://example.com/api/mcp/", {
        headers: {
          authorization: "Bearer production-key",
          "X-IntaCMS-Authorization": "Bearer ignored",
        },
      }),
      { ...credentials, enabled: false, serve },
    )
    expect(serve).toHaveBeenCalledOnce()
  })
})
