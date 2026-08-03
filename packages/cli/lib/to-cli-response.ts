import { PayloadApiError, type JsonValue } from '@open-artifact/site-management'
import type { Context } from 'hono'

export function toCliResponse(context: Context, result: JsonValue | Error): Response {
  if (result instanceof PayloadApiError) {
    return context.json({ error: result.message, details: result.details }, 502)
  }
  if (result instanceof Error) return context.json({ error: result.message }, 400)

  return Response.json(result)
}
