import { describe, expect, it } from "vite-plus/test"

import { validateGa4PropertyId } from "@/core/lib/validation/validate-ga4-property-id"

describe("validateGa4PropertyId", () => {
  it("数字だけのプロパティ ID を受け付ける", () => {
    expect(validateGa4PropertyId("123456789")).toBe(true)
  })

  it("未入力は受け付ける（未接続のまま保存できる）", () => {
    expect(validateGa4PropertyId("")).toBe(true)
    expect(validateGa4PropertyId(null)).toBe(true)
    expect(validateGa4PropertyId(undefined)).toBe(true)
  })

  it("G- から始まる測定 ID は、プロパティ ID と違うことを伝えて拒否する", () => {
    expect(validateGa4PropertyId("G-ABC123XYZ")).toContain("測定 ID")
  })

  it("数字以外を含む値や長すぎる値は拒否する", () => {
    expect(validateGa4PropertyId("properties/123")).toEqual(expect.any(String))
    expect(validateGa4PropertyId("1".repeat(21))).toEqual(expect.any(String))
  })
})
