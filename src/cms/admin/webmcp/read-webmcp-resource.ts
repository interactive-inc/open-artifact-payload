import type { WebMcpExecution } from "@/cms/admin/webmcp/webmcp-types"

/** Read through the same-origin REST API so Payload authenticates the browser session. */
export async function readWebMcpResource(url: URL, execution: WebMcpExecution) {
  const response = await fetch(url, {
    credentials: "same-origin",
    cache: "no-store",
    signal: execution.signal,
    headers: { Accept: "application/json" },
  })

  if (!response.ok) return { ok: false, error: `CMS request failed (${response.status})` }

  const document: unknown = await response.json()

  return { ok: true, document }
}
