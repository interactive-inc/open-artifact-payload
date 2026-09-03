import { expect, test } from "@playwright/test"

import { e2eFixtures } from "../helpers/e2e-fixtures"

test.describe("Works", () => {
  test("制作実績一覧から公開実績の詳細へ遷移できる", async ({ page }) => {
    await page.goto("http://localhost:3000/works")

    const workLink = page.locator(`a[href="/works/${e2eFixtures.publishedWork.slug}"]`)
    await expect(workLink).toBeVisible()

    await workLink.click()
    await expect(page).toHaveURL(`http://localhost:3000/works/${e2eFixtures.publishedWork.slug}`, {
      timeout: 30_000,
    })
    await expect(
      page.getByRole("heading", { level: 1, name: e2eFixtures.publishedWork.title, exact: true }),
    ).toBeVisible()
  })

  test("下書きの制作実績は一覧にも詳細にも出ない", async ({ page }) => {
    await page.goto("http://localhost:3000/works")
    await expect(page.getByText(e2eFixtures.draftWork.title, { exact: true })).toHaveCount(0)
    await expect(page.locator(`a[href="/works/${e2eFixtures.draftWork.slug}"]`)).toHaveCount(0)

    const response = await page.goto(`http://localhost:3000/works/${e2eFixtures.draftWork.slug}`)
    expect(response?.status()).toBe(404)
  })
})
