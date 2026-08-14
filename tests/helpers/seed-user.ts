import type { Page } from "@playwright/test"

export const testUser = {
  email: "dev@payloadcms.com",
  password: "test",
}

export const previewUser = {
  email: "preview-e2e@payloadcms.com",
  password: "test-password-1234",
}

export const previewMcpApiKeys = {
  active: "preview-e2e-active-00000000-0000-4000-8000-000000000001",
  expired: "preview-e2e-expired-00000000-0000-4000-8000-000000000002",
}

export async function getCurrentUserID(page: Page): Promise<string | number> {
  const meResponse = await page.request.get("http://localhost:3000/api/users/me")
  if (!meResponse.ok()) throw new Error(`Failed to read E2E user: ${meResponse.status()}`)

  const meBody: unknown = await meResponse.json()
  const currentUserID =
    meBody !== null &&
    typeof meBody === "object" &&
    "user" in meBody &&
    meBody.user !== null &&
    typeof meBody.user === "object" &&
    "id" in meBody.user &&
    (typeof meBody.user.id === "string" || typeof meBody.user.id === "number")
      ? meBody.user.id
      : undefined
  if (currentUserID === undefined) throw new Error("Failed to resolve E2E user id")
  return currentUserID
}

/** E2E専用ユーザーだけを削除し、ほかのローカルユーザーは保持する。 */
export async function cleanupTestUser(page: Page): Promise<void> {
  const currentUserID = await getCurrentUserID(page)
  const deleteResponse = await page.request.delete(
    `http://localhost:3000/api/users/${currentUserID}`,
  )
  if (!deleteResponse.ok()) {
    throw new Error(`Failed to clean up E2E user ${currentUserID}: ${deleteResponse.status()}`)
  }
}
