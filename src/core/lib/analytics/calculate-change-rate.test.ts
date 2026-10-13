import { describe, expect, it } from "vite-plus/test"

import { calculateChangeRate } from "@/core/lib/analytics/calculate-change-rate"

describe("calculateChangeRate", () => {
  it("前の期間からの増減を百分率の整数で返す", () => {
    expect(calculateChangeRate({ current: 112, previous: 100 })).toBe(12)
    expect(calculateChangeRate({ current: 97, previous: 100 })).toBe(-3)
  })

  it("端数は四捨五入する", () => {
    expect(calculateChangeRate({ current: 3, previous: 2 })).toBe(50)
    expect(calculateChangeRate({ current: 2, previous: 3 })).toBe(-33)
  })

  it("前の期間が0なら比べられないので null", () => {
    expect(calculateChangeRate({ current: 5, previous: 0 })).toBeNull()
    expect(calculateChangeRate({ current: 0, previous: 0 })).toBeNull()
  })
})
