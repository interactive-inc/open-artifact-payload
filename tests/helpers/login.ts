import type { Page } from "@playwright/test"
import { expect } from "@playwright/test"

type Props = {
  page: Page
  serverURL?: string
  user: {
    email: string
    password: string
  }
}

/**
 * Logs the user into the admin panel via the login page.
 */
export async function login(props: Props): Promise<void> {
  const serverURL = props.serverURL ?? "http://localhost:3000"
  await props.page.goto(`${serverURL}/admin/login`)

  await props.page.fill("#field-email", props.user.email)
  await props.page.fill("#field-password", props.user.password)
  await props.page.click('button[type="submit"]')

  await props.page.waitForURL(`${serverURL}/admin`)

  // ダッシュボードはカスタム + 日本語ローカライズ済みのため、
  // ロケールに依存しないヘッダーのアカウントリンクでログイン成功を判定する。
  const accountLink = props.page.locator('a[href="/admin/account"]')
  await expect(accountLink).toBeVisible()
}
