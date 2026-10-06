import { describe, expect, it } from "vite-plus/test"

import { splitListItems } from "@/core/lib/rich-text/split-list-items"

describe("splitListItems", () => {
  it("1行を1項目にする", () => {
    expect(splitListItems("一つ目\n二つ目\n三つ目")).toEqual(["一つ目", "二つ目", "三つ目"])
  })

  it("前後の空白を除き、空の行は項目にしない", () => {
    expect(splitListItems("\n  一つ目  \n\n　\n二つ目\n")).toEqual(["一つ目", "二つ目"])
  })

  it("Windows の改行コードでも行を分ける", () => {
    expect(splitListItems("一つ目\r\n二つ目")).toEqual(["一つ目", "二つ目"])
  })

  it("項目がなければ空の配列を返す", () => {
    expect(splitListItems("")).toEqual([])
    expect(splitListItems(null)).toEqual([])
  })
})
