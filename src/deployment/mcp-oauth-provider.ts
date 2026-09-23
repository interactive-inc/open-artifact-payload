import { OAuthProvider } from "@cloudflare/workers-oauth-provider"

import { isMcpOAuthIdentity, mcpOAuthScopes } from "@/core/mcp/oauth-identity"

type Handler = {
  fetch(request: Request, env: CloudflareEnv, context: ExecutionContext): Promise<Response>
}

/** OAuthの暗号・PKCE・期限・audience・refresh/revokeは公式providerに委ねる。 */
export function createMcpOAuthProvider(origin: string, handler: Handler) {
  return new OAuthProvider<CloudflareEnv>({
    apiRoute: `${origin}/mcp`,
    apiHandler: {
      async fetch(request, env, context) {
        const url = new URL(request.url)
        if (!["/mcp", "/mcp/"].includes(url.pathname)) return new Response(null, { status: 404 })
        // 認証情報はHTTPヘッダーに変換せず、OpenNextのリクエスト固有contextへ渡す。
        url.pathname = "/api/mcp/"
        const forwarded = new Request(url, request)
        // WranglerとNextのRequest宣言が重なるため、同じRequestのclone型を境界で揃える。
        const response = await handler.fetch(forwarded.clone() as Request, env, context)
        // 雛形は末尾slashなし、案件はslashありにも対応する。Nextの正規化を
        // クライアントへ返すとBasic認証付きの旧APIへ誘導するため内部で1回だけ追う。
        const location = response.headers.get("location")
        const canonical = new URL(url)
        canonical.pathname = "/api/mcp"
        if (response.status === 308 && location && new URL(location, url).href === canonical.href) {
          await response.body?.cancel()
          return handler.fetch(new Request(canonical, forwarded), env, context)
        }
        return response
      },
    },
    defaultHandler: handler,
    authorizeEndpoint: `${origin}/oauth/authorize/`,
    tokenEndpoint: `${origin}/oauth/token`,
    clientRegistrationEndpoint: `${origin}/oauth/register`,
    clientIdMetadataDocumentEnabled: true,
    accessTokenTTL: 15 * 60,
    refreshTokenTTL: 30 * 24 * 60 * 60,
    scopesSupported: [...mcpOAuthScopes, "offline_access"],
    resourceMetadata: {
      resource: `${origin}/mcp`,
      scopes_supported: [...mcpOAuthScopes],
      resource_name: "Inta CMS",
    },
    tokenExchangeCallback: ({ props, requestedScope }) => {
      if (!isMcpOAuthIdentity(props)) throw new Error("Invalid CMS authorization grant")
      // refresh時にscopeを絞った場合も、そのaccess tokenの権限だけを渡す。
      return { accessTokenProps: { ...props, scopes: requestedScope } }
    },
  })
}
