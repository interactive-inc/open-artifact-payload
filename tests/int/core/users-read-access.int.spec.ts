import { getPayload } from "payload"
import { describe, expect, test } from "vite-plus/test"

import config from "@/payload.config"

describe("users read access", () => {
  test("editors can read only themselves while administrators can list users", async () => {
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })
    const editorApiKey = `editor-key-${crypto.randomUUID()}`
    const administratorApiKey = `admin-key-${crypto.randomUUID()}`
    const editor = await payload.create({
      collection: "users",
      data: {
        email: `users-editor-${crypto.randomUUID()}@example.com`,
        password: "test-password-1234",
        roles: ["editor"],
        enableAPIKey: true,
        apiKey: editorApiKey,
      },
    })
    const administrator = await payload.create({
      collection: "users",
      data: {
        email: `users-admin-${crypto.randomUUID()}@example.com`,
        password: "test-password-1234",
        roles: ["admin"],
        enableAPIKey: true,
        apiKey: administratorApiKey,
      },
    })

    const editorView = await payload.find({
      collection: "users",
      depth: 0,
      limit: 100,
      overrideAccess: false,
      user: editor,
    })
    expect(editorView.docs.map((user) => user.id)).toEqual([editor.id])
    expect(editorView.docs.some((user) => user.apiKey === administratorApiKey)).toBe(false)

    const administratorView = await payload.find({
      collection: "users",
      depth: 0,
      limit: 100,
      overrideAccess: false,
      user: administrator,
    })
    expect(administratorView.docs.map((user) => user.id)).toContain(editor.id)
    expect(administratorView.docs.map((user) => user.id)).toContain(administrator.id)
  })
})
