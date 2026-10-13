import { describe, expect, it } from "vite-plus/test"

import { listPeriodDates } from "@/core/lib/analytics/list-period-dates"

describe("listPeriodDates", () => {
  it("開始日から終了日までの日付を順に並べる", () => {
    expect(listPeriodDates({ startDate: "2026-09-29", endDate: "2026-10-02" })).toEqual([
      "2026-09-29",
      "2026-09-30",
      "2026-10-01",
      "2026-10-02",
    ])
  })

  it("開始日と終了日が同じなら1日だけ", () => {
    expect(listPeriodDates({ startDate: "2026-10-13", endDate: "2026-10-13" })).toEqual([
      "2026-10-13",
    ])
  })
})
