import config from "@payload-config"
import { getPayload } from "payload"

import { handleOAuthPage } from "@/core/mcp/oauth-pages"
import { getMcpOAuthHelpers } from "@/platform/cloudflare/mcp-oauth-context"

async function handle(request: Request) {
  return handleOAuthPage(request, await getPayload({ config }), getMcpOAuthHelpers())
}

export const GET = handle
export const POST = handle
