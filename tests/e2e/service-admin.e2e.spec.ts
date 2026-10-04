import { expect, test } from "@playwright/test"

import { login } from "../helpers/login"
import { serviceAdminUser } from "../helpers/seed-user"

test("serviceAdmin 単独でMCPメニューとキー作成画面を利用できる", async ({ page }) => {
  await login({ page, user: serviceAdminUser })

  const me = await page.request.get("http://localhost:3000/api/users/me/")
  expect((await me.json()).user.roles).toEqual(["serviceAdmin"])

  const openMenu = page.getByRole("button", { name: "開く メニュー", exact: true })
  if (await openMenu.isVisible()) await openMenu.click()

  const keysLink = page.locator('nav a[href^="/admin/collections/payload-mcp-api-keys"]')
  await expect(keysLink).toBeVisible()
  await keysLink.click()
  await expect(page.getByRole("heading", { name: "API Keys", exact: true })).toBeVisible()

  await page.goto("http://localhost:3000/admin/collections/payload-mcp-api-keys/create/")
  await expect(page.locator('input[name="label"]')).toBeEditable()
  // Payload 3.90 から API キーは有効化のチェックボックスではなく生成ボタンで作る
  const generateKey = page.locator("#generate-api-key")
  await expect(generateKey).toBeEnabled()
  await generateKey.click()
  await expect(page.locator("#apiKey")).toHaveValue(/.+/)

  await page.goto("http://localhost:3000/admin/account/")
  await expect(page.locator('input[name="email"]')).toBeEditable()

  await page.goto("http://localhost:3000/admin/collections/users/create/")
  await expect(page.locator('input[name="email"]')).toBeEditable()

  await page.goto("http://localhost:3000/admin/globals/site-settings/")
  await expect(page.locator('input[name="siteName"]')).toBeEditable()
})
