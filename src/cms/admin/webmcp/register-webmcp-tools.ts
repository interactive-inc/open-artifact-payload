import type { WebMcpTool } from "@/cms/admin/webmcp/webmcp-types"

/** Own registrations through the mounted element; unsupported browsers keep the normal UI. */
export function registerWebMcpTools(element: HTMLElement, tools: ReadonlyArray<WebMcpTool>) {
  const context: unknown = Reflect.get(element.ownerDocument, "modelContext")

  if (!context || typeof context !== "object" || !("registerTool" in context)) return
  if (typeof context.registerTool !== "function") return

  const controller = new AbortController()

  try {
    for (const tool of tools) {
      Promise.resolve(context.registerTool(tool, { signal: controller.signal })).catch((error) => {
        if (controller.signal.aborted) return
        controller.abort()
        console.warn("WebMCP tool registration failed", error)
      })
    }
  } catch (error) {
    controller.abort()
    console.warn("WebMCP tool registration failed", error)
  }

  return () => controller.abort()
}
