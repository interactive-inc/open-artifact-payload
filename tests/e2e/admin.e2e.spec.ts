import { test, expect, Page } from "@playwright/test"
import { login } from "../helpers/login"
import { e2eFixtures } from "../helpers/e2e-fixtures"
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

function readDocumentID(body: unknown): number | string | undefined {
  if (body === null || typeof body !== "object" || !("doc" in body)) return undefined

  const doc = body.doc
  if (doc === null || typeof doc !== "object" || !("id" in doc)) return undefined
  if (typeof doc.id === "string" || typeof doc.id === "number") return doc.id

  return undefined
}

function readDocumentCount(body: unknown): number | undefined {
  if (body === null || typeof body !== "object" || !("docs" in body)) return undefined
  if (!Array.isArray(body.docs)) return undefined

  return body.docs.length
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

type DraftPreviewCase = { slug: "news" | "works"; publishedAt: string }

// 下書き作成 → ライブプレビュー反映 → (works は) 公開側に漏れないこと、を 1 コレクション分検証する。
// news と works を 1 テストで回すと CI では 120 秒の予算を共有して落ちるため、テストごとに呼ぶ。
async function verifyDraftLivePreview(page: Page, testCase: DraftPreviewCase): Promise<void> {
  const unique = Date.now()
  const marker = `${testCase.slug} ライブプレビュー QA ${unique}`
  const documentSlug = `qa-${testCase.slug}-${unique}`
  let documentID: number | string | undefined

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
  const savedDocument: unknown = await saveResponse.json()
  documentID = readDocumentID(savedDocument) ?? documentID
  expect(documentID).toBeDefined()

  const previewFrame = page.locator("iframe").first()
  await page.getByRole("button", { name: "プレビュー", exact: true }).click()
  await expect(previewFrame).toBeVisible({ timeout: 60_000 })
  await expect(previewFrame).toHaveAttribute(
    "src",
    new RegExp(`/next/preview\\?path=%2F${testCase.slug}%2F${documentSlug}`),
  )

  await expect(
    previewFrame.contentFrame().getByRole("heading", { name: marker, exact: true }),
  ).toBeVisible({ timeout: 60_000 })

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
        const apiResult: unknown = await apiResponse.json()
        expect(readDocumentCount(apiResult)).toBe(0)
      } finally {
        await anonymousContext.close()
      }
    }
  }
}

test.describe("Admin Panel", () => {
  test.describe.configure({ timeout: 120_000 })
  let page: Page

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext()
    page = await context.newPage()

    await login({ page, user: testUser })

    // ライブプレビューの iframe が開く公開ページは dev server が初回アクセス時にコンパイルする。
    // CI ではその時間がプレビュー描画の待ち時間を超えるため、先に一度ずつ開いて温めておく。
    for (const path of [
      "/ja",
      "/ja/about",
      "/ja/service",
      "/ja/news",
      `/ja/news/${e2eFixtures.publishedNews.slug}`,
      "/ja/works",
      `/ja/works/${e2eFixtures.publishedWork.slug}`,
    ]) {
      await page.goto(`http://localhost:3000${path}`, {
        waitUntil: "domcontentloaded",
        timeout: 120_000,
      })
    }
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
    const listURL = "http://localhost:3000/admin/collections/users"

    await gotoAdminPage(page, listURL)
    // 一覧ビューは表示設定 (depth / limit) をクエリに追記するため pathname だけで判定する
    await expect(page).toHaveURL((currentURL) => currentURL.pathname === new URL(listURL).pathname)
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

  // DB は実行ごとに作り直すため、書き換えた値を UI 操作で戻さない。
  // テストの独立性は fixture を起点にした一意な marker で保つ。
  test("サイト名の保存内容が公開ヘッダーとフッターへ反映される", async () => {
    const settingsURL = "http://localhost:3000/admin/globals/site-settings"
    const siteNameInput = page.locator('input[name="siteName"]')
    const marker = `${e2eFixtures.siteName} [QA-${Date.now()}]`

    await gotoAdminPage(page, settingsURL)
    await expect(page).toHaveURL(settingsURL)
    await expect(siteNameInput).toBeVisible({ timeout: 60_000 })

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
  })

  test("トップページの下書きがライブプレビューへ反映される", async () => {
    const homeURL = "http://localhost:3000/admin/globals/home-page"
    const heroTitleInput = page.locator('input[name="hero.title"]')

    await gotoAdminPage(page, homeURL)
    await expect(heroTitleInput).toBeVisible({ timeout: 60_000 })
    const marker = `ライブプレビュー QA ${Date.now()}`
    const previewFrame = page.locator("iframe").first()

    await page.getByRole("button", { name: "プレビュー", exact: true }).click()
    await expect(previewFrame).toBeVisible({ timeout: 60_000 })
    await expect(previewFrame).toHaveAttribute("src", /\/next\/preview\?path=%2F/)

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
    ).toBeVisible({ timeout: 60_000 })
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
      await expect(titleInput).toBeVisible({ timeout: 60_000 })
      const marker = `${testCase.slug} ライブプレビュー QA ${Date.now()}`
      const previewFrame = page.locator("iframe").first()

      await page.getByRole("button", { name: "プレビュー", exact: true }).click()
      await expect(previewFrame).toBeVisible({ timeout: 60_000 })
      await expect(previewFrame).toHaveAttribute(
        "src",
        new RegExp(`/next/preview\\?path=${testCase.previewPath}`),
      )

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
      ).toBeVisible({ timeout: 60_000 })
    }
  })

  test("お知らせの下書き作成がライブプレビューへ反映される", async () => {
    await verifyDraftLivePreview(page, { slug: "news", publishedAt: "2026-08-08 14:00" })
  })

  test("制作実績の下書き作成がライブプレビューへ反映され公開側に漏れない", async () => {
    await verifyDraftLivePreview(page, { slug: "works", publishedAt: "2026-08-08" })
  })
})
