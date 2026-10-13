import { describe, expect, it } from "vite-plus/test"

import { formatJstDateTime } from "@/core/lib/analytics/format-jst-date-time"

describe("formatJstDateTime", () => {
  it("日本時間の月/日 時:分にする", () => {
    expect(formatJstDateTime("2026-10-14T01:05:00.000Z")).toBe("10/14 10:05")
  })

  it("UTC では前日でも日本時間の日付で表す", () => {
    expect(formatJstDateTime("2026-10-13T15:30:00.000Z")).toBe("10/14 00:30")
  })
})
