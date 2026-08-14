import { expect, test } from "@playwright/test"

type StoryIndex = {
  entries: Record<string, { id: string; type: string }>
}

test("all stories render without browser runtime errors", async ({ baseURL, browser, request }) => {
  if (!baseURL) throw new Error("Storybook baseURL is not configured")

  const indexResponse = await request.get(`${baseURL}/index.json`)
  expect(indexResponse.ok()).toBe(true)
  const index = (await indexResponse.json()) as StoryIndex
  const stories = Object.values(index.entries)
    .filter((entry) => entry.type === "story")
    .sort((left, right) => left.id.localeCompare(right.id))

  const failures: string[] = []

  for (const story of stories) {
    const page = await browser.newPage()
    const runtimeErrors: string[] = []

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
      }
    } catch (error) {
      runtimeErrors.push(error instanceof Error ? error.message : String(error))
    } finally {
      await page.close()
    }

    if (runtimeErrors.length > 0) {
      failures.push(`${story.id}: ${[...new Set(runtimeErrors)].join(" | ")}`)
    }
  }

  console.log(
    `Storybook browser smoke: ${stories.length - failures.length}/${stories.length} passed`,
  )
  expect(failures, failures.join("\n")).toEqual([])
})
