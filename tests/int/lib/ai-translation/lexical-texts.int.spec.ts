import { describe, expect, it } from "vite-plus/test"

import { applyLexicalTexts } from "@/core/lib/ai-translation/apply-lexical-texts"
import { collectLexicalTexts } from "@/core/lib/ai-translation/collect-lexical-texts"

const lexicalValue = {
  root: {
    type: "root",
    children: [
      {
        type: "paragraph",
        children: [
          { type: "text", text: "こんにちは", format: 1 },
          {
            type: "link",
            fields: { url: "https://example.com" },
            children: [{ type: "text", text: "リンク文言" }],
          },
        ],
      },
      {
        type: "heading",
        tag: "h2",
        children: [{ type: "text", text: "見出し" }],
      },
    ],
  },
}

describe("collectLexicalTexts", () => {
  it("text ノードを走査順で収集する", () => {
    expect(collectLexicalTexts(lexicalValue)).toEqual(["こんにちは", "リンク文言", "見出し"])
  })

  it("null や非オブジェクトは空配列を返す", () => {
    expect(collectLexicalTexts(null)).toEqual([])
    expect(collectLexicalTexts("text")).toEqual([])
  })
})

describe("applyLexicalTexts", () => {
  it("走査順で text を差し替え、構造・URL・書式は維持する", () => {
    const applied = applyLexicalTexts(lexicalValue, ["Hello", "Link label", "Heading"])

    if (applied instanceof Error) throw applied

    expect(collectLexicalTexts(applied)).toEqual(["Hello", "Link label", "Heading"])
    expect(JSON.stringify(applied)).toContain("https://example.com")
    expect(JSON.stringify(applied)).toContain('"format":1')
    // 元データは変更しない
    expect(collectLexicalTexts(lexicalValue)).toEqual(["こんにちは", "リンク文言", "見出し"])
  })

  it("件数が一致しない場合は Error を返す", () => {
    expect(applyLexicalTexts(lexicalValue, ["Hello"])).toBeInstanceOf(Error)
  })
})
