import type { SiteManagementRuntime } from "@open-artifact/site-management"
import { Hono } from "hono"

import {
  createCollectionCliInputSchema,
  deleteCollectionCliInputSchema,
  findCollectionCliInputSchema,
  findGlobalCliInputSchema,
  listCollectionCliInputSchema,
  updateCollectionCliInputSchema,
  updateGlobalCliInputSchema,
} from "./cli-input-schemas"
import { toCliResponse } from "./to-cli-response"

export function buildCliApp(runtime: SiteManagementRuntime): Hono {
  const app = new Hono()

  app.onError((error, context) => context.json({ error: error.message }, 500))
  app.notFound((context) => context.json({ error: "Unknown command. Run with --help." }, 404))

  app.post("/collections/list", async (context) => {
    const raw = await context.req.json().catch(() => new Error("Invalid command input"))
    if (raw instanceof Error) return context.json({ error: raw.message }, 400)
    const input = listCollectionCliInputSchema.safeParse(raw)
    if (!input.success) return context.json({ error: input.error.message }, 400)

    return toCliResponse(context, await runtime.listCollectionDocuments(input.data))
  })

  app.post("/collections/get", async (context) => {
    const raw = await context.req.json().catch(() => new Error("Invalid command input"))
    if (raw instanceof Error) return context.json({ error: raw.message }, 400)
    const input = findCollectionCliInputSchema.safeParse(raw)
    if (!input.success) return context.json({ error: input.error.message }, 400)

    return toCliResponse(context, await runtime.findCollectionDocument(input.data))
  })

  app.post("/collections/create", async (context) => {
    const raw = await context.req.json().catch(() => new Error("Invalid command input"))
    if (raw instanceof Error) return context.json({ error: raw.message }, 400)
    const input = createCollectionCliInputSchema.safeParse(raw)
    if (!input.success) return context.json({ error: input.error.message }, 400)

    return toCliResponse(context, await runtime.createCollectionDocument(input.data))
  })

  app.post("/collections/update", async (context) => {
    const raw = await context.req.json().catch(() => new Error("Invalid command input"))
    if (raw instanceof Error) return context.json({ error: raw.message }, 400)
    const input = updateCollectionCliInputSchema.safeParse(raw)
    if (!input.success) return context.json({ error: input.error.message }, 400)

    return toCliResponse(context, await runtime.updateCollectionDocument(input.data))
  })

  app.post("/collections/delete", async (context) => {
    const raw = await context.req.json().catch(() => new Error("Invalid command input"))
    if (raw instanceof Error) return context.json({ error: raw.message }, 400)
    const input = deleteCollectionCliInputSchema.safeParse(raw)
    if (!input.success) return context.json({ error: input.error.message }, 400)

    return toCliResponse(context, await runtime.deleteCollectionDocument(input.data))
  })

  app.post("/globals/get", async (context) => {
    const raw = await context.req.json().catch(() => new Error("Invalid command input"))
    if (raw instanceof Error) return context.json({ error: raw.message }, 400)
    const input = findGlobalCliInputSchema.safeParse(raw)
    if (!input.success) return context.json({ error: input.error.message }, 400)

    return toCliResponse(context, await runtime.findGlobal(input.data))
  })

  app.post("/globals/update", async (context) => {
    const raw = await context.req.json().catch(() => new Error("Invalid command input"))
    if (raw instanceof Error) return context.json({ error: raw.message }, 400)
    const input = updateGlobalCliInputSchema.safeParse(raw)
    if (!input.success) return context.json({ error: input.error.message }, 400)

    return toCliResponse(context, await runtime.updateGlobal(input.data))
  })

  return app
}
