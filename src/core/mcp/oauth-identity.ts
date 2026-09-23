export const mcpOAuthScopes = ["mcp:read", "mcp:write"] as const

/** Workerで検証したOAuthトークンだけが持つ、リクエスト内の認証情報。 */
export type McpOAuthIdentity = {
  kind: "intacms-oauth"
  userId: string
  scopes: string[]
}

export function isMcpOAuthIdentity(value: unknown): value is McpOAuthIdentity {
  if (!value || typeof value !== "object") return false
  return (
    "kind" in value &&
    value.kind === "intacms-oauth" &&
    "userId" in value &&
    typeof value.userId === "string" &&
    /^\d+$/.test(value.userId) &&
    "scopes" in value &&
    Array.isArray(value.scopes) &&
    value.scopes.every((scope) => typeof scope === "string")
  )
}
