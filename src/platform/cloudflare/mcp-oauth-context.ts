import type { OAuthHelpers } from "@cloudflare/workers-oauth-provider"
import { getCloudflareContext } from "@opennextjs/cloudflare"

import { isMcpOAuthIdentity } from "@/core/mcp/oauth-identity"

/** OAuthProviderがリクエスト内に注入する。外部のリクエストヘッダーではない。 */
type OAuthEnvironment = CloudflareEnv & { OAUTH_PROVIDER?: OAuthHelpers }

export function getMcpOAuthIdentity() {
  try {
    const { ctx } = getCloudflareContext()
    return isMcpOAuthIdentity(ctx.props) ? ctx.props : null
  } catch {
    // Next dev / Payload CLIにはWorkerのOAuth contextがない。
    return null
  }
}

export function getMcpOAuthHelpers(): OAuthHelpers | undefined {
  try {
    return (getCloudflareContext().env as OAuthEnvironment).OAUTH_PROVIDER
  } catch {
    return undefined
  }
}
