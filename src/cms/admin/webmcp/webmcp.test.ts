// @vitest-environment jsdom

import { act, render, cleanup } from "@testing-library/react"
import { createElement, StrictMode } from "react"
import { afterEach, describe, expect, it, vi } from "vite-plus/test"
import { z } from "zod"

import { buildWebMcpFieldsSchema } from "@/cms/admin/webmcp/build-webmcp-fields-schema"
import { createWebMcpTool } from "@/cms/admin/webmcp/create-webmcp-tool"
import { mergeWebMcpValues } from "@/cms/admin/webmcp/merge-webmcp-values"
import { WebMcpTools } from "@/cms/admin/webmcp/webmcp-tools"
import type { WebMcpTool } from "@/cms/admin/webmcp/webmcp-types"

afterEach(() => {
  cleanup()
  Reflect.deleteProperty(document, "modelContext")
  vi.restoreAllMocks()
})

describe("WebMCP registration lifecycle", () => {
  it("does not register anything in unsupported browsers", () => {
    expect(() => render(createElement(WebMcpTools, { tools: [] }))).not.toThrow()
  })

  it("keeps one current registration through StrictMode, updates and unmounts", async () => {
    const registered = new Map<string, WebMcpTool>()
    Object.defineProperty(document, "modelContext", {
      configurable: true,
      value: {
        registerTool: async (tool: WebMcpTool, options: { signal: AbortSignal }) => {
          if (registered.has(tool.name)) throw new Error("Duplicate tool")
          registered.set(tool.name, tool)
          options.signal.addEventListener("abort", () => registered.delete(tool.name))
        },
      },
    })
    const tool = (value: string) =>
      createWebMcpTool({
        name: "read",
        description: "Read",
        schema: z.strictObject({}),
        readOnly: true,
        execute: () => value,
      })
    const view = render(
      createElement(StrictMode, null, createElement(WebMcpTools, { tools: [tool("first")] })),
    )

    await expect(registered.get("read")?.execute({})).resolves.toBe("first")
    view.rerender(
      createElement(StrictMode, null, createElement(WebMcpTools, { tools: [tool("second")] })),
    )
    await expect(registered.get("read")?.execute({})).resolves.toBe("second")
    expect(registered.size).toBe(1)
    view.unmount()
    expect(registered.size).toBe(0)
  })

  it("cleans up partial registrations when the browser rejects a tool", async () => {
    const signals: AbortSignal[] = []
    vi.spyOn(console, "warn").mockImplementation(() => {})
    Object.defineProperty(document, "modelContext", {
      configurable: true,
      value: {
        registerTool: async (_tool: WebMcpTool, options: { signal: AbortSignal }) => {
          signals.push(options.signal)
          throw new Error("Permission policy denied")
        },
      },
    })

    await act(async () => {
      render(
        createElement(WebMcpTools, {
          tools: [
            createWebMcpTool({
              name: "read",
              description: "Read",
              schema: z.strictObject({}),
              readOnly: true,
              execute: () => null,
            }),
          ],
        }),
      )
    })
    expect(signals[0]?.aborted).toBe(true)
  })
})

describe("WebMCP edit contracts", () => {
  it("rejects unknown input and cancelled calls before performing any work", async () => {
    const execute = vi.fn()
    const tool = createWebMcpTool({
      name: "edit",
      description: "Edit",
      schema: z.strictObject({ title: z.string() }),
      readOnly: false,
      execute,
    })

    expect(await tool.execute({ title: "ok", _status: "published" })).toMatchObject({ ok: false })
    expect(await tool.execute({ title: "ok" }, { signal: AbortSignal.abort() })).toMatchObject({
      ok: false,
    })
    expect(execute).not.toHaveBeenCalled()
  })

  it("preserves unsaved siblings and replaces arrays without mutating the original", () => {
    const current = { profile: { enabled: true, rows: [{ label: "old" }] }, title: "human edit" }
    const merged = mergeWebMcpValues(current, { profile: { rows: [{ label: "new" }] } })

    expect(merged).toEqual({
      profile: { enabled: true, rows: [{ label: "new" }] },
      title: "human edit",
    })
    expect(current.profile.rows).toEqual([{ label: "old" }])
  })

  it("rejects unknown, hidden, read-only, unauthorized and publication fields", () => {
    const schema = buildWebMcpFieldsSchema({
      fields: [
        { name: "title", type: "text" },
        { name: "secret", type: "text", admin: { hidden: true } },
        { name: "computed", type: "text", admin: { readOnly: true } },
        { name: "script", type: "code" },
        { name: "_status", type: "text" },
      ],
      permissions: { title: true, secret: true, computed: true, _status: true },
      operation: "update",
    })

    expect(schema.safeParse({ title: "edited" }).success).toBe(true)
    for (const field of ["secret", "computed", "script", "_status", "unknown"]) {
      expect(schema.safeParse({ [field]: "edited" }).success).toBe(false)
    }
  })

  it("validates nested array fields, relationship IDs and select values", () => {
    const schema = buildWebMcpFieldsSchema({
      fields: [
        {
          name: "profile",
          type: "group",
          fields: [{ name: "rows", type: "array", fields: [{ name: "label", type: "text" }] }],
        },
        { name: "categories", type: "select", hasMany: true, options: ["info", "other"] },
        { name: "image", type: "upload", relationTo: "media" },
      ],
      permissions: true,
      operation: "update",
    })

    expect(
      schema.safeParse({ profile: { rows: [{ label: "new" }] }, categories: ["info"], image: 12 })
        .success,
    ).toBe(true)
    expect(schema.safeParse({ profile: { rows: [{ injected: true }] } }).success).toBe(false)
    expect(schema.safeParse({ categories: ["unknown"] }).success).toBe(false)
    expect(schema.safeParse({ image: { id: 12 } }).success).toBe(false)
  })

  it("does not restore nested fields removed from sanitized permissions", () => {
    const schema = buildWebMcpFieldsSchema({
      fields: [
        { name: "group", type: "group", fields: [{ name: "private", type: "text" }] },
        { type: "tabs", tabs: [{ name: "tab", fields: [{ name: "private", type: "text" }] }] },
      ],
      permissions: {
        group: { create: true, read: true, update: true },
        tab: { create: true, read: true, update: true },
      },
      operation: "update",
    })

    expect(schema.safeParse({ group: { private: "denied" } }).success).toBe(false)
    expect(schema.safeParse({ tab: { private: "denied" } }).success).toBe(false)
  })
})
