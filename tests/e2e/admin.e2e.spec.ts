import { test, expect, Page } from "@playwright/test"
import { login } from "../helpers/login"
import { cleanupTestUser, getCurrentUserID, testUser } from "../helpers/seed-user"

test.describe("Admin Panel", () => {
  let page: Page

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext()
    page = await context.newPage()

    await login({ page, user: testUser })
  })

  test.afterAll(async () => {
    if (page) {
      try {
        await cleanupTestUser(page)
      } finally {
        await page.context().close()
      }
    }
  })

  test("ダッシュボードにタスクカードが表示される", async () => {
    await page.goto("http://localhost:3000/admin")
    await expect(page).toHaveURL("http://localhost:3000/admin")
    const heading = page.locator("h1", { hasText: "今日は何をしますか" })
    await expect(heading).toBeVisible()
    const addNewsLink = page.locator("a", { hasText: "お知らせを追加する" })
    await expect(addNewsLink).toBeVisible()
  })

  test("can navigate to list view", async () => {
    await page.goto("http://localhost:3000/admin/collections/users")
    await expect(page).toHaveURL("http://localhost:3000/admin/collections/users")
    const listViewArtifact = page.locator("h1", { hasText: "ユーザー一覧" }).first()
    await expect(listViewArtifact).toBeVisible()
  })

  test("can navigate to edit view", async () => {
    const currentUserID = await getCurrentUserID(page)
    await page.goto(`http://localhost:3000/admin/collections/users/${currentUserID}`)
    await expect(page).toHaveURL(
      new RegExp(`/admin/collections/users/${encodeURIComponent(String(currentUserID))}$`),
    )
    const editViewArtifact = page.locator('input[name="email"]')
    await expect(editViewArtifact).toBeVisible()
  })
})
