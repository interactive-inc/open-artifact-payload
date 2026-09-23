import { expect, test, type Page } from "@playwright/test"

import { login } from "../helpers/login"
import { testUser } from "../helpers/seed-user"

const native = process.env.WEBMCP_NATIVE === "1"

test.use({
  channel: native ? "chrome" : "chromium",
  launchOptions: native
    ? {
        args: [
          "--enable-experimental-web-platform-features",
          "--enable-features=WebMCP,WebMCPTesting",
        ],
      }
    : {},
})

async function toolNames(page: Page): Promise<string[]> {
  return page.evaluate(async () => {
    const context = Reflect.get(document, "modelContext")
    if (!context) return []
    const tools: { name: string }[] = await context.getTools()
    return tools.map((tool) => tool.name)
  })
}

async function callTool(
  page: Page,
  name: string,
  input: Record<string, unknown> = {},
): Promise<unknown> {
  return page.evaluate(
    async (invocation) => {
      const context = Reflect.get(document, "modelContext")
      const tools: { name: string }[] = await context.getTools()
      const tool = tools.find((candidate) => candidate.name === invocation.name)
      if (!tool) throw new Error(`Tool is missing: ${invocation.name}`)
      const result: unknown = await context.executeTool(tool, JSON.stringify(invocation.input))
      if (typeof result === "string") {
        try {
          return JSON.parse(result)
        } catch {
          return result
        }
      }
      return result
    },
    { name, input },
  )
}

/** CI's pinned Chromium predates document.modelContext; native Chrome is exercised separately. */
async function installTestContext(page: Page) {
  if (native) return

  await page.addInitScript(() => {
    type Tool = { name: string; execute: (input: unknown) => Promise<unknown> }
    const tools = new Map<string, Tool>()
    Object.defineProperty(document, "modelContext", {
      configurable: true,
      value: {
        async registerTool(tool: Tool, options: { signal: AbortSignal }) {
          if (tools.has(tool.name)) throw new Error(`Duplicate tool: ${tool.name}`)
          if (options.signal.aborted) return
          tools.set(tool.name, tool)
          options.signal.addEventListener("abort", () => tools.delete(tool.name), { once: true })
        },
        async getTools() {
          return Array.from(tools.values())
        },
        async executeTool(tool: Tool, input: string) {
          return tool.execute(JSON.parse(input))
        },
      },
    })
  })
}

test("WebMCP discovers content only after login and follows navigation/logout", async ({
  page,
}) => {
  await installTestContext(page)
  await page.goto("http://localhost:3000/admin/login/")
  expect(await toolNames(page)).toEqual([])
  await login({ page, user: testUser })
  await expect.poll(() => toolNames(page)).toContain("cms_list_resources")
  const resources = await callTool(page, "cms_list_resources")
  expect(JSON.stringify(resources)).toContain("news")
  expect(JSON.stringify(resources)).not.toContain("contact-submissions")
  expect(JSON.stringify(resources)).not.toContain("payload-mcp-api-keys")
  expect(await callTool(page, "cms_read_content", { resource: "news", limit: 2 })).toMatchObject({
    ok: true,
  })

  await callTool(page, "cms_open_document", { resource: "news" }).catch((error: unknown) => {
    if (
      !(error instanceof Error) ||
      !/context was destroyed|navigation|closed/i.test(error.message)
    )
      throw error
  })
  await expect(page).toHaveURL(/\/admin\/collections\/news\/(create|\d+)\/?/)
  await expect.poll(() => toolNames(page)).toContain("cms_get_current_document")
  await page.goto("http://localhost:3000/admin/logout/")
  await expect.poll(() => toolNames(page)).toEqual([])
})

test("WebMCP edits the live news form, preserves human edits and saves a private draft", async ({
  page,
}) => {
  await installTestContext(page)
  await login({ page, user: testUser })
  await page.goto("http://localhost:3000/admin/collections/news/create/")
  await expect.poll(() => toolNames(page)).toContain("cms_get_current_document")
  const marker = `webmcp-${Date.now()}`
  await page.locator('input[name="slug"]').fill(marker)
  await expect
    .poll(async () => JSON.stringify(await callTool(page, "cms_get_current_document")))
    .toContain(marker)
  await expect
    .poll(() =>
      callTool(page, "cms_update_current_document", {
        values: {
          title: marker,
          publishedAt: "2026-01-01T00:00:00.000Z",
          body: {
            root: {
              type: "root",
              version: 1,
              format: "",
              indent: 0,
              direction: "ltr",
              children: [
                {
                  type: "paragraph",
                  version: 1,
                  format: "",
                  indent: 0,
                  direction: "ltr",
                  children: [
                    {
                      type: "text",
                      version: 1,
                      text: "WebMCP本文",
                      detail: 0,
                      format: 0,
                      mode: "normal",
                      style: "",
                    },
                  ],
                },
              ],
            },
          },
        },
      }),
    )
    .toMatchObject({ ok: true })
  await expect(page.locator('input[name="title"]')).toHaveValue(marker)
  await expect(page.locator('input[name="slug"]')).toHaveValue(marker)
  await expect(page.getByText("WebMCP本文", { exact: true })).toBeVisible()
  await expect
    .poll(() => callTool(page, "cms_save_current_document", { mode: "draft" }))
    .toMatchObject({ ok: true, saved: true })
  const saved = await page.request.get(
    `http://localhost:3000/api/news?where[slug][equals]=${marker}&draft=true`,
  )
  expect((await saved.json()).docs[0]).toMatchObject({
    title: marker,
    slug: marker,
    _status: "draft",
  })
  const anonymous = await page.context().browser()!.newContext()
  try {
    const publicResponse = await anonymous.request.get(
      `http://localhost:3000/api/news?where[slug][equals]=${marker}`,
    )
    expect((await publicResponse.json()).docs).toHaveLength(0)
  } finally {
    await anonymous.close()
  }

  await expect
    .poll(() => callTool(page, "cms_save_current_document", { mode: "publish" }))
    .toMatchObject({ ok: true, saved: true })
  const publicContext = await page.context().browser()!.newContext()
  try {
    const published = await publicContext.request.get(
      `http://localhost:3000/api/news?where[slug][equals]=${marker}`,
    )
    expect((await published.json()).docs[0]).toMatchObject({ title: marker, _status: "published" })
  } finally {
    await publicContext.close()
  }
})

test("WebMCP retains editor permissions for settings and restricted fields", async ({
  page,
  browser,
}) => {
  await installTestContext(page)
  await login({ page, user: testUser })
  const editor = {
    email: `webmcp-editor-${Date.now()}@example.test`,
    password: "test-password-1234",
  }
  const created = await page.request.post("http://localhost:3000/api/users", {
    data: { ...editor, roles: ["editor"] },
  })
  expect(created.ok()).toBe(true)
  const account = await created.json()
  const context = await browser.newContext()
  const editorPage = await context.newPage()
  try {
    await installTestContext(editorPage)
    await login({ page: editorPage, user: editor })
    await editorPage.goto("http://localhost:3000/admin/globals/site-settings/")
    await expect.poll(() => toolNames(editorPage)).toContain("cms_get_current_document")
    expect(await callTool(editorPage, "cms_get_current_document")).toMatchObject({ canEdit: false })
    expect(await callTool(editorPage, "cms_save_current_document", { mode: "save" })).toMatchObject(
      { ok: false },
    )
  } finally {
    await context.close()
    await page.request.delete(`http://localhost:3000/api/users/${account.doc.id}`)
  }
})

test("WebMCP updates nested page data and validates save mode", async ({ page }) => {
  await installTestContext(page)
  await login({ page, user: testUser })
  await page.goto("http://localhost:3000/admin/globals/about/")
  await expect.poll(() => toolNames(page)).toContain("cms_get_current_document")
  await expect
    .poll(() =>
      callTool(page, "cms_update_current_document", { values: { hero: { enabled: false } } }),
    )
    .toMatchObject({ ok: true })
  expect(await callTool(page, "cms_save_current_document", { mode: "save" })).toMatchObject({
    ok: false,
  })
  await expect
    .poll(() => callTool(page, "cms_save_current_document", { mode: "draft" }))
    .toMatchObject({ ok: true, saved: true })
  const saved = await page.request.get("http://localhost:3000/api/globals/about?draft=true")
  expect(await saved.json()).toMatchObject({ hero: { enabled: false }, _status: "draft" })
})

test("normal CMS editing works without WebMCP support", async ({ page }) => {
  await page.addInitScript(() =>
    Object.defineProperty(document, "modelContext", { configurable: true, value: undefined }),
  )
  await login({ page, user: testUser })
  await page.goto("http://localhost:3000/admin/collections/news/create/")
  await expect(page.locator('input[name="title"]')).toBeVisible()
  await page.locator('input[name="title"]').fill("通常の編集")
  await expect(page.locator('input[name="title"]')).toHaveValue("通常の編集")
  expect(await toolNames(page)).toEqual([])
})
