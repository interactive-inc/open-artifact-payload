import { describe, expect, it } from "vite-plus/test"

import { PHONE_MAX_LENGTH } from "@/core/lib/validation/text-limits"
import { validatePhone } from "@/core/lib/validation/validate-phone"

describe("validatePhone", () => {
  it("数字と区切り記号の電話番号を受理する", () => {
    expect(validatePhone("03-1234-5678")).toBe(true)
    expect(validatePhone("+81 3 1234 5678")).toBe(true)
    expect(validatePhone("(03) 1234-5678")).toBe(true)
  })

  it("空値は任意入力として受理する", () => {
    expect(validatePhone("")).toBe(true)
    expect(validatePhone(null)).toBe(true)
    expect(validatePhone(undefined)).toBe(true)
  })

  it("任意テキストや改行を拒否する", () => {
    expect(validatePhone("03-1234-5678（代表）")).not.toBe(true)
    expect(validatePhone("03-1234-5678\n06-1111-2222")).not.toBe(true)
    expect(validatePhone("tel:0312345678")).not.toBe(true)
  })

  it("上限ちょうどは受理し、1 文字超過は拒否する", () => {
    expect(validatePhone("1".repeat(PHONE_MAX_LENGTH))).toBe(true)
    expect(validatePhone("1".repeat(PHONE_MAX_LENGTH + 1))).not.toBe(true)
  })
})
