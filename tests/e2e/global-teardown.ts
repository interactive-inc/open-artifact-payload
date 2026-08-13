import { request } from "@playwright/test"

import { testUser } from "../helpers/seed-user"

const baseURL = "http://localhost:3000"

/**
 * The webServer seeds the admin for every E2E invocation, including runs that do
 * not select the admin suite. Remove that exact user while the server is still
 * available; a 401 means the admin suite already removed it.
 */
export default async function globalTeardown(): Promise<void> {
  const context = await request.newContext({ baseURL })

  try {
    const loginResponse = await context.post("/api/users/login", { data: testUser })
    if (loginResponse.status() === 401) return
    if (!loginResponse.ok()) {
      throw new Error(`Failed to authenticate E2E cleanup user: ${loginResponse.status()}`)
    }

    const body: unknown = await loginResponse.json()
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

    const deleteResponse = await context.delete(`/api/users/${encodeURIComponent(String(id))}`)
    if (!deleteResponse.ok()) {
      throw new Error(`Failed to clean up E2E user ${id}: ${deleteResponse.status()}`)
    }
  } finally {
    await context.dispose()
  }
}
