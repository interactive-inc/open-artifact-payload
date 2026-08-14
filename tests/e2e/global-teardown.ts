import { request } from "@playwright/test"

import { previewUser, testUser } from "../helpers/seed-user"

const baseURL = "http://localhost:3000"

/**
 * The webServer seeds the admins used by every E2E invocation, including runs
 * that select only one suite. Remove those exact users and preview API keys
 * while the server is still available; a 401 means a suite already removed one.
 */
export default async function globalTeardown(): Promise<void> {
  const context = await request.newContext({ baseURL })

  try {
    for (const user of [testUser, previewUser]) {
      const loginResponse = await context.post("/api/users/login", { data: user })
      if (loginResponse.status() === 401) continue
      if (!loginResponse.ok()) {
        throw new Error(`Failed to authenticate E2E cleanup user: ${loginResponse.status()}`)
      }

      const id = getUserId(await loginResponse.json())
      if (user.email === previewUser.email) await deleteMcpApiKeys(context, id)

      const deleteResponse = await context.delete(`/api/users/${encodeURIComponent(String(id))}`)
      if (!deleteResponse.ok()) {
        throw new Error(`Failed to clean up E2E user ${id}: ${deleteResponse.status()}`)
      }
    }
  } finally {
    await context.dispose()
  }
}

function getUserId(body: unknown): string | number {
  const id =
    body !== null &&
    typeof body === "object" &&
    "user" in body &&
    body.user !== null &&
    typeof body.user === "object" &&
    "id" in body.user &&
    (typeof body.user.id === "string" || typeof body.user.id === "number")
      ? body.user.id
      : undefined
  if (id === undefined) throw new Error("Failed to resolve E2E cleanup user id")
  return id
}

async function deleteMcpApiKeys(
  context: Awaited<ReturnType<typeof request.newContext>>,
  userId: string | number,
): Promise<void> {
  const response = await context.get(
    `/api/payload-mcp-api-keys?where[user][equals]=${encodeURIComponent(String(userId))}&limit=100`,
  )
  if (!response.ok()) {
    throw new Error(`Failed to find E2E MCP API keys: ${response.status()}`)
  }

  const body: unknown = await response.json()
  const docs =
    body !== null && typeof body === "object" && "docs" in body && Array.isArray(body.docs)
      ? body.docs
      : []
  for (const doc of docs) {
    const keyId =
      doc !== null &&
      typeof doc === "object" &&
      "id" in doc &&
      (typeof doc.id === "string" || typeof doc.id === "number")
        ? doc.id
        : undefined
    if (keyId === undefined) continue
    const deleteResponse = await context.delete(
      `/api/payload-mcp-api-keys/${encodeURIComponent(String(keyId))}`,
    )
    if (!deleteResponse.ok()) {
      throw new Error(`Failed to clean up E2E MCP API key ${keyId}: ${deleteResponse.status()}`)
    }
  }
}
