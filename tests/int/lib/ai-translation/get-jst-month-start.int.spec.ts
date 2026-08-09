import { describe, expect, it } from "vite-plus/test"

import { getJstMonthStart } from "@/core/lib/ai-translation/get-jst-month-start"

describe("getJstMonthStart", () => {
  it("日本時間の月初 0:00 を UTC で返す", () => {
    // 2026-07-15 12:00 JST
    const now = new Date("2026-07-15T03:00:00.000Z")

    expect(getJstMonthStart(now).toISOString()).toBe("2026-06-30T15:00:00.000Z")
  })

  it("UTC ではまだ前月でも JST で月が変わっていれば新しい月初になる", () => {
    // 2026-08-01 00:30 JST = 2026-07-31 15:30 UTC
    const now = new Date("2026-07-31T15:30:00.000Z")

    expect(getJstMonthStart(now).toISOString()).toBe("2026-07-31T15:00:00.000Z")
  })

  it("JST でまだ前月なら前月の月初を返す", () => {
    // 2026-07-31 23:30 JST = 2026-07-31 14:30 UTC
    const now = new Date("2026-07-31T14:30:00.000Z")

    expect(getJstMonthStart(now).toISOString()).toBe("2026-06-30T15:00:00.000Z")
  })
})
