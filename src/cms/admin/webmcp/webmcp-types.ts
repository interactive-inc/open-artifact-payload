import type { z } from "zod"

export type WebMcpExecution = { signal?: AbortSignal }

export type WebMcpTool = {
  name: string
  description: string
  inputSchema: Record<string, unknown>
  annotations: { readOnlyHint: boolean; untrustedContentHint: boolean; consequentialHint: boolean }
  execute: (input: unknown, execution?: WebMcpExecution) => Promise<unknown>
}

export type WebMcpToolDefinition<Schema extends z.ZodType> = {
  name: string
  description: string
  schema: Schema
  readOnly: boolean
  consequential?: boolean
  execute: (input: z.output<Schema>, execution: WebMcpExecution) => unknown
}
