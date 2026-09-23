import handler from "./.open-next/worker.js"

import { protectDevelopmentRequest } from "@/deployment/protect-development-request"
import { isMcpOAuthMachinePath } from "@/deployment/mcp-oauth-paths"
import { createMcpOAuthProvider } from "@/deployment/mcp-oauth-provider"

export default {
  async fetch(request, env, context) {
    const oauthEnabled = env.MCP_OAUTH_ENABLED === "true" && Boolean(env.OAUTH_KV)
    const url = new URL(request.url)
    const origin = new URL(env.NEXT_PUBLIC_SERVER_URL || request.url).origin
    const oauthMachineRequest = oauthEnabled && isMcpOAuthMachinePath(url.pathname)
    if (
      oauthEnabled &&
      request.method === "POST" &&
      /^\/oauth\/(?:register|token)\/?$/.test(url.pathname)
    ) {
      const ip = request.headers.get("CF-Connecting-IP") ?? "local"
      const limited = await env.OAUTH_RATE_LIMITER?.limit({ key: `${url.pathname}:${ip}` })
      if (limited && !limited.success)
        return Response.json(
          { error: "temporarily_unavailable" },
          {
            status: 429,
            headers: { "Retry-After": "60", "Cache-Control": "no-store" },
          },
        )
    }
    // 別のHostから取得したトークンを受理しない。issuerとresourceの正本は環境URL。
    if (
      oauthEnabled &&
      url.origin !== origin &&
      (oauthMachineRequest || url.pathname.startsWith("/oauth/"))
    ) {
      return new Response("Invalid OAuth origin", { status: 400 })
    }
    const provider = oauthEnabled ? createMcpOAuthProvider(origin, handler) : null
    return protectDevelopmentRequest(request, {
      enabled: env.BASIC_AUTH_ENABLED === "true",
      bypassBasicAuth: oauthMachineRequest,
      username: env.BASIC_AUTH_USERNAME || null,
      password: env.BASIC_AUTH_PASSWORD || null,
      serve: (authenticated) => {
        if (!provider) return handler.fetch(authenticated, env, context)
        // Workerが直接処理する入口にはNextのtrailingSlashリダイレクトを挟まない。
        if (oauthMachineRequest && url.pathname !== "/mcp/") {
          const normalized = new URL(authenticated.url)
          normalized.pathname = normalized.pathname.replace(/\/$/, "")
          authenticated = new Request(normalized, authenticated)
        }
        return provider.fetch(authenticated, { ...env }, context)
      },
    })
  },
} satisfies ExportedHandler<CloudflareEnv>
