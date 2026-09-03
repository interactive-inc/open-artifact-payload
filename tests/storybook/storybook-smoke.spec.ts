import { AxeBuilder } from "@axe-core/playwright"
import { expect, test } from "@playwright/test"

type StoryIndex = {
  entries: Record<string, { id: string; type: string }>
}

/**
 * a11y 検査の許容リスト。key は story id、value はその story で許容する rule id。
 *
 * ここに載せてよいのは axe の誤検出だと根拠を示せるものだけ。根拠は必ず
 * コメントで残す (どの前提が Storybook 固有で、本番ではどう満たされるか)。
 * 「今は直せない」「後で直す」は根拠にならない。本物の違反は許容せず、
 * 対象コンポーネントの実装を直すこと。恒久的な逃げ道にしない。
 */
const A11Y_KNOWN_ISSUES: Readonly<Record<string, ReadonlyArray<string>>> = {}

// minor / moderate は参考情報にとどめ、serious 以上だけを失敗として扱う。
const BLOCKING_IMPACTS: ReadonlyArray<string> = ["critical", "serious"]

/** axe の target は shadow DOM をまたぐとネストするため、1 本のセレクター文字列へ平坦化する。 */
function formatTarget(target: ReadonlyArray<string | string[]>): string {
  const parts: string[] = []

  for (const item of target) {
    if (Array.isArray(item)) parts.push(item.join(" >>> "))
    else parts.push(item)
  }

  return parts.join(", ")
}

test("all stories render without browser runtime errors or serious a11y violations", async ({
  baseURL,
  browser,
  request,
}) => {
  if (!baseURL) throw new Error("Storybook baseURL is not configured")

  const indexResponse = await request.get(`${baseURL}/index.json`)
  expect(indexResponse.ok()).toBe(true)
  const index = (await indexResponse.json()) as StoryIndex
  const stories = Object.values(index.entries)
    .filter((entry) => entry.type === "story")
    .sort((left, right) => left.id.localeCompare(right.id))

  const failures: string[] = []
  const a11yFailures: string[] = []
  // AxeBuilder は結果集計用に同じ context でページを開くため、browser.newPage() の
  // 暗黙 context では "Please use browser.newContext()" で失敗する。明示的に作る。
  const context = await browser.newContext()

  for (const story of stories) {
    const page = await context.newPage()
    const runtimeErrors: string[] = []
    const a11yViolations: string[] = []

    page.on("pageerror", (error) => runtimeErrors.push(error.message))
    page.on("console", (message) => {
      if (message.type() !== "error") return
      const text = message.text()
      // Example media intentionally does not exist in the Storybook fixture.
      if (text.startsWith("Failed to load resource:")) return
      runtimeErrors.push(text)
    })

    try {
      const response = await page.goto(
        `${baseURL}/iframe.html?id=${encodeURIComponent(story.id)}`,
        {
          waitUntil: "networkidle",
        },
      )
      await page.waitForTimeout(100)

      const bodyText = await page.locator("body").innerText()
      const renderedStorybookError =
        bodyText.includes("The component failed to render properly") ||
        bodyText.includes("Error rendering component")
      if (!response?.ok()) runtimeErrors.push(`iframe response: ${response?.status() ?? "none"}`)
      if (renderedStorybookError) runtimeErrors.push("Storybook displayed its render error panel")
      if ((await page.locator("#storybook-root").count()) === 0) {
        runtimeErrors.push("Storybook root was not created")
      } else {
        const allowedRules = A11Y_KNOWN_ISSUES[story.id] ?? []
        const axeResults = await new AxeBuilder({ page }).include("#storybook-root").analyze()

        for (const violation of axeResults.violations) {
          if (!BLOCKING_IMPACTS.includes(violation.impact ?? "")) continue
          if (allowedRules.includes(violation.id)) continue

          for (const node of violation.nodes) {
            a11yViolations.push(
              `${story.id}: ${violation.id} (${violation.impact}) - ${formatTarget(node.target)}`,
            )
          }
        }
      }
    } catch (error) {
      runtimeErrors.push(error instanceof Error ? error.message : String(error))
    } finally {
      await page.close()
    }

    if (runtimeErrors.length > 0) {
      failures.push(`${story.id}: ${[...new Set(runtimeErrors)].join(" | ")}`)
    }
    a11yFailures.push(...new Set(a11yViolations))
  }

  await context.close()

  console.log(
    `Storybook browser smoke: ${stories.length - failures.length}/${stories.length} passed, a11y violations: ${a11yFailures.length}`,
  )
  expect(failures, failures.join("\n")).toEqual([])
  expect(a11yFailures, a11yFailures.join("\n")).toEqual([])
})
