import { describe, expect, it } from "vite-plus/test"

import { parseTranslationResponse } from "@/core/lib/ai-translation/parse-translation-response"

describe("parseTranslationResponse", () => {
  it("translations 配列をパースできる", () => {
    const parsed = parseTranslationResponse({
      rawText: '{"translations": ["Hello", "World"]}',
      expectedCount: 2,
    })

    expect(parsed).toEqual(["Hello", "World"])
  })

  it("コードフェンス付きでもパースできる", () => {
    const parsed = parseTranslationResponse({
      rawText: '```json\n{"translations": ["Hello"]}\n```',
      expectedCount: 1,
    })

    expect(parsed).toEqual(["Hello"])
  })

  it("件数不一致は Error", () => {
    const parsed = parseTranslationResponse({
      rawText: '{"translations": ["Hello"]}',
      expectedCount: 2,
    })

    expect(parsed).toBeInstanceOf(Error)
  })

  it("translations が無い・文字列以外を含む・非 JSON は Error", () => {
    expect(
      parseTranslationResponse({ rawText: '{"answer": "chat response"}', expectedCount: 1 }),
    ).toBeInstanceOf(Error)
    expect(
      parseTranslationResponse({ rawText: '{"translations": [123]}', expectedCount: 1 }),
    ).toBeInstanceOf(Error)
    expect(
      parseTranslationResponse({ rawText: "旅行プランはこちらです…", expectedCount: 1 }),
    ).toBeInstanceOf(Error)
  })
})
