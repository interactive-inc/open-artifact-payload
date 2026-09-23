import { createRequire } from "node:module"
import path from "node:path"
import { describe, expect, test, vi } from "vite-plus/test"
import type { z } from "zod/v3"

const require = createRequire(import.meta.url)
const converter: {
  convertCollectionSchemaToZod: (schema: Record<string, unknown>) => z.ZodObject<z.ZodRawShape>
} = require(
  path.join(
    path.dirname(require.resolve("@payloadcms/plugin-mcp")),
    "utils/schemaConversion/convertCollectionSchemaToZod.js",
  ),
)

describe("MCP schemas on Workers", () => {
  test("builds editable schemas without dynamic code generation", () => {
    vi.stubGlobal("Function", () => {
      throw new Error("Workers disallow dynamic code generation")
    })

    try {
      const schema = converter.convertCollectionSchemaToZod({
        type: "object",
        properties: {
          id: { type: "number" },
          title: { type: "string", minLength: 1 },
          summary: { type: ["string", "null"] },
          category: { type: "string", enum: ["info", "press"] },
          body: { type: "object", additionalProperties: true },
          related: { oneOf: [{ type: "number" }, { $ref: "#/definitions/news" }] },
          rows: {
            type: ["array", "null"],
            items: {
              type: "object",
              properties: { name: { type: "string" } },
              required: ["name"],
            },
          },
        },
        required: ["id", "title"],
      })
      const content = {
        title: "News",
        summary: null,
        category: "info",
        body: { root: { children: [{ type: "paragraph" }] } },
        related: 42,
        rows: [{ name: "Example" }],
      }

      expect(schema.parse(content)).toEqual(content)
      expect(schema.shape).not.toHaveProperty("id")
      expect(schema.partial().parse({ title: "Updated" })).toEqual({ title: "Updated" })
      expect(schema.safeParse({ title: 42 }).success).toBe(false)
      expect(schema.safeParse({ title: "" }).success).toBe(false)
      expect(schema.safeParse({ title: "News", category: "invalid" }).success).toBe(false)
      expect(schema.safeParse({ title: "News", summary: 42 }).success).toBe(false)
      expect(schema.safeParse({ title: "News", rows: [{}] }).success).toBe(false)
    } finally {
      vi.unstubAllGlobals()
    }
  })
})
