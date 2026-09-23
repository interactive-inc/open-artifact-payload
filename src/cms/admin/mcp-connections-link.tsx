import React from "react"
import { getCloudflareContext } from "@opennextjs/cloudflare"

export async function McpConnectionsLink() {
  const { env } = await getCloudflareContext({ async: true })
  if (env.MCP_OAUTH_ENABLED !== "true") return null
  return (
    <div className="ictms-open-public-site">
      {/* Route HandlerのHTMLなので、RSC遷移ではなく通常のnavigationを使う。 */}
      {/* oxlint-disable-next-line next/no-html-link-for-pages */}
      <a className="ictms-open-public-site__link" href="/oauth/connections/">
        AI接続の管理
      </a>
    </div>
  )
}
