import { test, expect, Page } from "@playwright/test"
import { login } from "../helpers/login"
import { getCurrentUserID, testUser } from "../helpers/seed-user"

async function gotoAdminPage(page: Page, url: string): Promise<void> {
  const expectedPath = new URL(url).pathname

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      await page.goto(url)
      break
    } catch (error) {
      const wasAborted = error instanceof Error && error.message.includes("net::ERR_ABORTED")
      if (!wasAborted || attempt === 1) throw error
      if (new URL(page.url()).pathname === expectedPath) break
    }
  }

  await page.waitForURL((currentURL) => currentURL.pathname === expectedPath, { timeout: 60_000 })
}

async function gotoCollectionCreate(page: Page, slug: string): Promise<void> {
  const createPath = `/admin/collections/${slug}/create`

  try {
    await page.goto(`http://localhost:3000${createPath}`)
  } catch (error) {
    if (!(error instanceof Error) || !error.message.includes("net::ERR_ABORTED")) throw error
  }

  await page.waitForURL((url) => {
    const path = url.pathname
    return path === createPath || path.startsWith(`/admin/collections/${slug}/`)
  })
}

test.describe("Admin Panel", () => {
  test.describe.configure({ timeout: 120_000 })
  let page: Page

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext()
    page = await context.newPage()

    await login({ page, user: testUser })
  })

  test.afterAll(async () => {
    await page?.context().close()
  })

  test("ダッシュボードにタスクカードが表示される", async () => {
    await gotoAdminPage(page, "http://localhost:3000/admin")
    await expect(page).toHaveURL("http://localhost:3000/admin")
    const heading = page.locator("h1", { hasText: "今日は何をしますか" })
    await expect(heading).toBeVisible()
    const addNewsLink = page.locator("a", { hasText: "お知らせを追加する" })
    await expect(addNewsLink).toBeVisible()
    await expect(page.getByRole("link", { name: "AI翻訳設定", exact: true })).toHaveCount(0)
  })

  test("管理者が利用可能な全コレクション一覧を開ける", async () => {
    const cases = [
      { slug: "media", heading: "メディア一覧" },
      { slug: "ai-translation-logs", heading: "AI翻訳ログ" },
      { slug: "news", heading: "お知らせ一覧" },
      { slug: "faq", heading: "よくある質問一覧" },
      { slug: "contact-submissions", heading: "問い合わせ一覧" },
      { slug: "works", heading: "制作実績一覧" },
      { slug: "payload-mcp-api-keys", heading: "API Keys" },
    ] as const

    for (const testCase of cases) {
      const url = `http://localhost:3000/admin/collections/${testCase.slug}`
      await gotoAdminPage(page, url)
      await expect(page).toHaveURL((currentURL) => currentURL.pathname === new URL(url).pathname)
      await expect(page.getByRole("heading", { level: 1, name: testCase.heading })).toBeVisible({
        timeout: 60_000,
      })
    }
  })

  test("can navigate to list view", async () => {
    await gotoAdminPage(page, "http://localhost:3000/admin/collections/users")
    await expect(page).toHaveURL("http://localhost:3000/admin/collections/users")
    const listViewArtifact = page.locator("h1", { hasText: "ユーザー一覧" }).first()
    await expect(listViewArtifact).toBeVisible()
  })

  test("can navigate to edit view", async () => {
    const currentUserID = await getCurrentUserID(page)
    await gotoAdminPage(page, `http://localhost:3000/admin/collections/users/${currentUserID}`)
    await expect(page).toHaveURL(
      new RegExp(`/admin/collections/users/${encodeURIComponent(String(currentUserID))}$`),
    )
    const editViewArtifact = page.locator('input[name="email"]')
    await expect(editViewArtifact).toBeVisible()
  })

  test("FAQ を管理画面から作成して保存できる", async () => {
    const marker = `QA-E2E-${Date.now()}`

    await gotoAdminPage(page, "http://localhost:3000/admin/collections/faq/create")
    await page.locator('input[name="question"]').fill(marker)
    await page.locator('textarea[name="answer"]').fill("管理画面から入力した回答です。")
    const saveResponsePromise = page.waitForResponse(
      (response) =>
        new URL(response.url()).pathname === "/api/faq" && response.request().method() === "POST",
    )
    await page.getByRole("button", { name: "保存", exact: true }).click()
    const saveResponse = await saveResponsePromise

    expect(saveResponse.ok()).toBe(true)
    const savedDocument = (await saveResponse.json()) as { doc?: { id?: number | string } }
    const id = savedDocument.doc?.id
    expect(id).toBeDefined()

    await gotoAdminPage(page, "http://localhost:3000/admin/collections/faq")
    await expect(page.getByRole("link", { name: marker, exact: true })).toBeVisible()

    if (id !== undefined) {
      const response = await page.context().request.delete(`http://localhost:3000/api/faq/${id}`)
      expect(response.ok()).toBe(true)
    }
  })

  test("メディアをアップロードして代替テキストを再読込できる", async () => {
    const marker = `QA メディア ${Date.now()}`
    let mediaID: number | string | undefined

    try {
      await gotoAdminPage(page, "http://localhost:3000/admin/collections/media/create")
      const fileInput = page.locator('input[type="file"]')
      const altInput = page.locator('input[name="alt"]')
      await expect(fileInput).toHaveCount(1, { timeout: 60_000 })
      await expect(altInput).toBeVisible({ timeout: 60_000 })

      await fileInput.setInputFiles("public/og-default.png")
      await altInput.fill(marker)
      const uploadResponsePromise = page.waitForResponse(
        (response) =>
          new URL(response.url()).pathname === "/api/media" &&
          response.request().method() === "POST",
      )
      await page.getByRole("button", { name: "保存", exact: true }).click()
      const uploadResponse = await uploadResponsePromise
      expect(uploadResponse.ok()).toBe(true)
      const uploaded = (await uploadResponse.json()) as { doc?: { id?: number | string } }
      mediaID = uploaded.doc?.id
      expect(mediaID).toBeDefined()

      await expect(page).toHaveURL(new RegExp(`/admin/collections/media/${String(mediaID)}$`), {
        timeout: 60_000,
      })
      await page.reload()
      await expect(altInput).toHaveValue(marker, { timeout: 60_000 })
    } finally {
      if (mediaID !== undefined) {
        const response = await page
          .context()
          .request.delete(`http://localhost:3000/api/media/${mediaID}`)
        expect(response.ok()).toBe(true)
      }
    }
  })

  test("サイト名の保存内容が公開ヘッダーとフッターへ反映される", async () => {
    const settingsURL = "http://localhost:3000/admin/globals/site-settings"
    const siteNameInput = page.locator('input[name="siteName"]')

    await gotoAdminPage(page, settingsURL)
    await expect(page).toHaveURL(settingsURL)
    await expect(siteNameInput).toBeVisible({ timeout: 60_000 })
    const originalSiteName = await siteNameInput.inputValue()
    const restoreSiteName = originalSiteName || "Open Artifact Payload"
    const marker = `${restoreSiteName} [QA-${Date.now()}]`

    try {
      await siteNameInput.fill(marker)
      const saveResponsePromise = page.waitForResponse(
        (response) =>
          new URL(response.url()).pathname === "/api/globals/site-settings" &&
          response.request().method() !== "GET",
      )
      await page.getByRole("button", { name: "保存", exact: true }).click()
      const saveResponse = await saveResponsePromise
      expect(saveResponse.ok()).toBe(true)

      await page.goto("http://localhost:3000/")
      await expect(page.getByText(marker, { exact: true })).toHaveCount(2)
    } finally {
      await gotoAdminPage(page, settingsURL)
      await expect(siteNameInput).toBeVisible({ timeout: 60_000 })
      await siteNameInput.fill(restoreSiteName)
      const restoreResponsePromise = page.waitForResponse(
        (response) =>
          new URL(response.url()).pathname === "/api/globals/site-settings" &&
          response.request().method() !== "GET",
      )
      await page.getByRole("button", { name: "保存", exact: true }).click()
      const restoreResponse = await restoreResponsePromise
      expect(restoreResponse.ok()).toBe(true)
    }
  })

  test("トップページの下書きがライブプレビューへ反映される", async () => {
    const homeURL = "http://localhost:3000/admin/globals/home-page"
    const heroTitleInput = page.locator('input[name="hero.title"]')

    await gotoAdminPage(page, homeURL)
    await expect(heroTitleInput).toBeVisible({ timeout: 60_000 })
    const originalTitle = await heroTitleInput.inputValue()
    const marker = `ライブプレビュー QA ${Date.now()}`
    const previewFrame = page.locator("iframe").first()

    await page.getByRole("button", { name: "プレビュー", exact: true }).click()
    await expect(previewFrame).toBeVisible({ timeout: 20_000 })
    await expect(previewFrame).toHaveAttribute("src", /\/next\/preview\?path=%2F/)

    try {
      await heroTitleInput.fill(marker)
      const saveResponsePromise = page.waitForResponse(
        (response) =>
          new URL(response.url()).pathname === "/api/globals/home-page" &&
          response.request().method() !== "GET",
      )
      await page.getByRole("button", { name: "ドラフトを保存", exact: true }).click()
      const saveResponse = await saveResponsePromise
      expect(saveResponse.ok()).toBe(true)

      await expect(
        previewFrame.contentFrame().getByRole("heading", { name: marker, exact: true }),
      ).toBeVisible({ timeout: 20_000 })
    } finally {
      await gotoAdminPage(page, homeURL)
      await expect(heroTitleInput).toBeVisible({ timeout: 20_000 })
      await heroTitleInput.fill(originalTitle)
      const restoreResponsePromise = page.waitForResponse(
        (response) =>
          new URL(response.url()).pathname === "/api/globals/home-page" &&
          response.request().method() !== "GET",
      )
      await page.getByRole("button", { name: "ドラフトを保存", exact: true }).click()
      const restoreResponse = await restoreResponsePromise
      expect(restoreResponse.ok()).toBe(true)
    }
  })

  test("会社概要とサービスの下書きが各ライブプレビューへ反映される", async () => {
    const cases = [
      { slug: "about", previewPath: "%2Fabout" },
      { slug: "service", previewPath: "%2Fservice" },
    ] as const

    for (const testCase of cases) {
      const editURL = `http://localhost:3000/admin/globals/${testCase.slug}`
      const titleInput = page.locator('input[name="hero.title"]')

      await gotoAdminPage(page, editURL)
      await expect(titleInput).toBeVisible({ timeout: 20_000 })
      const originalTitle = await titleInput.inputValue()
      const marker = `${testCase.slug} ライブプレビュー QA ${Date.now()}`
      const previewFrame = page.locator("iframe").first()

      await page.getByRole("button", { name: "プレビュー", exact: true }).click()
      await expect(previewFrame).toBeVisible({ timeout: 20_000 })
      await expect(previewFrame).toHaveAttribute(
        "src",
        new RegExp(`/next/preview\\?path=${testCase.previewPath}`),
      )

      try {
        await titleInput.fill(marker)
        const saveResponsePromise = page.waitForResponse(
          (response) =>
            new URL(response.url()).pathname === `/api/globals/${testCase.slug}` &&
            response.request().method() !== "GET",
        )
        await page.getByRole("button", { name: "ドラフトを保存", exact: true }).click()
        const saveResponse = await saveResponsePromise
        expect(saveResponse.ok()).toBe(true)

        await expect(
          previewFrame.contentFrame().getByRole("heading", { name: marker, exact: true }),
        ).toBeVisible({ timeout: 20_000 })
      } finally {
        await gotoAdminPage(page, editURL)
        await expect(titleInput).toBeVisible({ timeout: 20_000 })
        await titleInput.fill(originalTitle)
        const restoreResponsePromise = page.waitForResponse(
          (response) =>
            new URL(response.url()).pathname === `/api/globals/${testCase.slug}` &&
            response.request().method() !== "GET",
        )
        await page.getByRole("button", { name: "ドラフトを保存", exact: true }).click()
        const restoreResponse = await restoreResponsePromise
        expect(restoreResponse.ok()).toBe(true)
      }
    }
  })

  test("お知らせと制作実績の下書き作成が各ライブプレビューへ反映される", async () => {
    const cases = [
      { slug: "news", publishedAt: "2026-08-08 14:00" },
      { slug: "works", publishedAt: "2026-08-08" },
    ] as const

    for (const testCase of cases) {
      const unique = Date.now()
      const marker = `${testCase.slug} ライブプレビュー QA ${unique}`
      const documentSlug = `qa-${testCase.slug}-${unique}`
      let documentID: number | string | undefined

      try {
        await gotoCollectionCreate(page, testCase.slug)
        const titleInput = page.locator('input[name="title"]')
        const slugInput = page.locator('input[name="slug"]')
        const publishedAtInput = page.locator("main").getByRole("textbox").nth(2)
        await expect(titleInput).toBeVisible({ timeout: 60_000 })
        await expect(publishedAtInput).toBeVisible({ timeout: 60_000 })

        const currentPath = new URL(page.url()).pathname
        const autoSavedID = currentPath.match(
          new RegExp(`/admin/collections/${testCase.slug}/([^/]+)$`),
        )?.[1]
        if (autoSavedID && autoSavedID !== "create") documentID = autoSavedID

        const saveResponsePromise = page.waitForResponse((response) => {
          const responsePath = new URL(response.url()).pathname
          const method = response.request().method()
          return (
            (responsePath === `/api/${testCase.slug}` ||
              responsePath.startsWith(`/api/${testCase.slug}/`)) &&
            (method === "POST" || method === "PATCH")
          )
        })
        await titleInput.fill(marker)
        await slugInput.fill(documentSlug)
        await publishedAtInput.fill(testCase.publishedAt)
        await publishedAtInput.press("Escape")
        const saveResponse = await saveResponsePromise
        expect(saveResponse.ok()).toBe(true)
        const savedDocument = (await saveResponse.json()) as { doc?: { id?: number | string } }
        documentID = savedDocument.doc?.id ?? documentID
        expect(documentID).toBeDefined()

        const previewFrame = page.locator("iframe").first()
        await page.getByRole("button", { name: "プレビュー", exact: true }).click()
        await expect(previewFrame).toBeVisible({ timeout: 20_000 })
        await expect(previewFrame).toHaveAttribute(
          "src",
          new RegExp(`/next/preview\\?path=%2F${testCase.slug}%2F${documentSlug}`),
        )

        await expect(
          previewFrame.contentFrame().getByRole("heading", { name: marker, exact: true }),
        ).toBeVisible({ timeout: 20_000 })

        if (testCase.slug === "works") {
          const browser = page.context().browser()
          expect(browser).not.toBeNull()
          if (browser) {
            const anonymousContext = await browser.newContext()
            const anonymousPage = await anonymousContext.newPage()
            try {
              await anonymousPage.goto("http://localhost:3000/works")
              await expect(anonymousPage.getByText(marker, { exact: true })).toHaveCount(0)
              await anonymousPage.goto("http://localhost:3000/")
              await expect(anonymousPage.getByText(marker, { exact: true })).toHaveCount(0)

              const apiResponse = await anonymousContext.request.get(
                `http://localhost:3000/api/works?where[slug][equals]=${documentSlug}`,
              )
              expect(apiResponse.ok()).toBe(true)
              const apiResult = (await apiResponse.json()) as { docs?: unknown[] }
              expect(apiResult.docs).toEqual([])
            } finally {
              await anonymousContext.close()
            }
          }
        }
      } finally {
        if (documentID !== undefined) {
          const response = await page
            .context()
            .request.delete(`http://localhost:3000/api/${testCase.slug}/${documentID}`)
          expect(response.ok()).toBe(true)
        }
      }
    }
  })
})
