import { z } from "zod"

import type { WebMcpTool, WebMcpToolDefinition } from "@/cms/admin/webmcp/webmcp-types"

/** Validate inputs at execution time as well as advertising their schema to the browser. */
export function createWebMcpTool<Schema extends z.ZodType>(
  definition: WebMcpToolDefinition<Schema>,
): WebMcpTool {
  return {
    name: definition.name,
    description: definition.description,
    inputSchema: z.toJSONSchema(definition.schema),
    annotations: {
      readOnlyHint: definition.readOnly,
      untrustedContentHint: true,
      consequentialHint: definition.consequential ?? false,
    },
    execute: async (input, execution = {}) => {
      const parsed = definition.schema.safeParse(input)

      if (!parsed.success) return { ok: false, error: "Invalid input", issues: parsed.error.issues }

      try {
        execution.signal?.throwIfAborted()

        return await definition.execute(parsed.data, execution)
      } catch (error) {
        return { ok: false, error: error instanceof Error ? error.message : "Operation failed" }
      }
    },
  }
}
