/** この完全一致の入口だけBasic認証を免除する。CMSと同意画面は免除しない。 */
export function isMcpOAuthMachinePath(pathname: string): boolean {
  return new Set([
    "/mcp",
    "/mcp/",
    "/oauth/token",
    "/oauth/token/",
    "/oauth/register",
    "/oauth/register/",
    "/.well-known/oauth-authorization-server",
    "/.well-known/oauth-authorization-server/",
    "/.well-known/oauth-protected-resource",
    "/.well-known/oauth-protected-resource/",
    "/.well-known/oauth-protected-resource/mcp",
    "/.well-known/oauth-protected-resource/mcp/",
  ]).has(pathname)
}
