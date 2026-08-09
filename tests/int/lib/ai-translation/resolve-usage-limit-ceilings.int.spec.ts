import { describe, expect, it } from "vite-plus/test"

import { resolveUsageLimitCeilings } from "@/core/lib/ai-translation/resolve-usage-limit-ceilings"

describe("resolveUsageLimitCeilings", () => {
  it("環境変数から天井値を読み取る", () => {
    const ceilings = resolveUsageLimitCeilings({
      AI_TRANSLATION_MAX_MONTHLY_RUNS: "50",
      AI_TRANSLATION_MAX_MONTHLY_CHARACTERS: "100000",
      AI_TRANSLATION_MAX_MONTHLY_COST_USD: "5",
      AI_TRANSLATION_MAX_PER_RUN_CHARACTERS: "10000",
    })

    expect(ceilings).toEqual({
      monthlyRunLimit: 50,
      monthlyCharacterLimit: 100000,
      monthlyCostLimitUsd: 5,
      perRunCharacterLimit: 10000,
    })
  })

  it("未設定の変数は含めない", () => {
    const ceilings = resolveUsageLimitCeilings({
      AI_TRANSLATION_MAX_MONTHLY_COST_USD: "5",
    })

    expect(ceilings).toEqual({ monthlyCostLimitUsd: 5 })
  })

  it("数値でない値・負の値・空文字は無視する", () => {
    const ceilings = resolveUsageLimitCeilings({
      AI_TRANSLATION_MAX_MONTHLY_RUNS: "abc",
      AI_TRANSLATION_MAX_MONTHLY_CHARACTERS: "-1",
      AI_TRANSLATION_MAX_MONTHLY_COST_USD: "",
    })

    expect(ceilings).toEqual({})
  })
})
