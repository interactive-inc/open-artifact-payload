import type { Field } from "payload"
import { describe, expect, it } from "vite-plus/test"

import { hasAiTranslatableField } from "@/core/lib/ai-translation/has-ai-translatable-field"

describe("hasAiTranslatableField", () => {
  it("localized な text があれば true", () => {
    const fields: Field[] = [
      { name: "slug", type: "text" },
      { name: "title", type: "text", localized: true },
    ]

    expect(hasAiTranslatableField(fields)).toBe(true)
  })

  it("ネストした group / array / tabs / blocks も判定する", () => {
    const groupFields: Field[] = [
      {
        name: "companyInfo",
        type: "group",
        fields: [{ name: "address", type: "text", localized: true }],
      },
    ]
    const tabsFields: Field[] = [
      {
        type: "tabs",
        tabs: [
          {
            name: "meta",
            label: "メタ",
            fields: [{ name: "description", type: "textarea", localized: true }],
          },
        ],
      },
    ]
    const blocksFields: Field[] = [
      {
        name: "sections",
        type: "blocks",
        blocks: [{ slug: "card", fields: [{ name: "heading", type: "text", localized: true }] }],
      },
    ]

    expect(hasAiTranslatableField(groupFields)).toBe(true)
    expect(hasAiTranslatableField(tabsFields)).toBe(true)
    expect(hasAiTranslatableField(blocksFields)).toBe(true)
  })

  it("localized な group は抽出ルールと同じく対象外（ボタンだけ出る状態を防ぐ）", () => {
    const fields: Field[] = [
      {
        name: "localizedGroup",
        type: "group",
        localized: true,
        fields: [{ name: "caption", type: "text", localized: true }],
      },
    ]

    expect(hasAiTranslatableField(fields)).toBe(false)
  })

  it("localized が無い・aiTranslate: false のみなら false", () => {
    const fields: Field[] = [
      { name: "slug", type: "text" },
      { name: "memo", type: "textarea", localized: true, custom: { aiTranslate: false } },
      { name: "count", type: "number" },
    ]

    expect(hasAiTranslatableField(fields)).toBe(false)
  })
})
