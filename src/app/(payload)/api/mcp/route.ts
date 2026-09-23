import config from "@payload-config"
import { handleEndpoints } from "payload"

/** Nextの末尾スラッシュを、MCPハンドラーが完全一致で判定するパスへ正規化する。 */
async function handleMcpRequest(request: Request): Promise<Response> {
  const url = new URL(request.url)

  url.pathname = url.pathname.replace(/\/$/, "")

  return handleEndpoints({ config, request: new Request(url, request) })
}

export const GET = handleMcpRequest
export const POST = handleMcpRequest
export const OPTIONS = handleMcpRequest
export const DELETE = handleMcpRequest
