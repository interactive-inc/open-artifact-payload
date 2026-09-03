import { getPayload, type Payload } from "payload"
import { beforeAll, describe, expect, it } from "vite-plus/test"

import config from "@/payload.config"
import { getJstMonthStart } from "@/core/lib/ai-translation/get-jst-month-start"
import { sumUsageLogs } from "@/core/lib/ai-translation/sum-usage-logs"

let payload: Payload

const createLog = async (props: {
  status: "pending" | "succeeded" | "failed" | "rejected"
  characterCount: number
  estimatedCostUsd: number
}) => {
  const created = await payload.create({
    collection: "ai-translation-logs",
    data: {
      targetKind: "collection",
      targetSlug: "news",
      targetTitle: "sum-usage-logs-test",
      sourceLocale: "ja",
      targetLocale: "en",
      model: "anthropic/claude-haiku-4-5",
      status: props.status,
      characterCount: props.characterCount,
      estimatedCostUsd: props.estimatedCostUsd,
    },
  })

  return created.id
}

describe("sumUsageLogs", () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  it("succeeded / failed / 有効な pending を合計し、rejected は含めない", async () => {
    const now = new Date()
    const monthStartIso = getJstMonthStart(now).toISOString()
    const pendingFreshIso = new Date(now.getTime() - 60_000).toISOString()

    const before = await sumUsageLogs({
      payload,
      monthStartIso,
      pendingFreshIso,
      beforeLogId: null,
    })

    if (before instanceof Error) throw before

    await createLog({ status: "succeeded", characterCount: 100, estimatedCostUsd: 0.01 })
    await createLog({ status: "failed", characterCount: 30, estimatedCostUsd: 0.005 })
    await createLog({ status: "rejected", characterCount: 999, estimatedCostUsd: 9 })

    const pendingLogId = await createLog({
      status: "pending",
      characterCount: 50,
      estimatedCostUsd: 0.02,
    })

    const after = await sumUsageLogs({
      payload,
      monthStartIso,
      pendingFreshIso,
      beforeLogId: null,
    })

    if (after instanceof Error) throw after

    expect(after.runCount - before.runCount).toBe(3)
    expect(after.characterCount - before.characterCount).toBe(180)
    expect(after.costUsd - before.costUsd).toBeCloseTo(0.035, 5)

    // 自分の予約より後（= id が大きい）の pending は数えない
    const ordered = await sumUsageLogs({
      payload,
      monthStartIso,
      pendingFreshIso,
      beforeLogId: pendingLogId,
    })

    if (ordered instanceof Error) throw ordered

    expect(ordered.runCount - before.runCount).toBe(2)
    expect(ordered.characterCount - before.characterCount).toBe(130)
    expect(ordered.costUsd - before.costUsd).toBeCloseTo(0.015, 5)
  })

  it("有効期限を過ぎた pending は集計に含めない", async () => {
    const now = new Date()
    const monthStartIso = getJstMonthStart(now).toISOString()

    const before = await sumUsageLogs({
      payload,
      monthStartIso,
      // すべての pending を stale とみなす境界
      pendingFreshIso: new Date(now.getTime() + 60_000).toISOString(),
      beforeLogId: null,
    })

    if (before instanceof Error) throw before

    await createLog({ status: "pending", characterCount: 70, estimatedCostUsd: 0.03 })

    const after = await sumUsageLogs({
      payload,
      monthStartIso,
      pendingFreshIso: new Date(now.getTime() + 60_000).toISOString(),
      beforeLogId: null,
    })

    if (after instanceof Error) throw after

    expect(after.runCount - before.runCount).toBe(0)
    expect(after.characterCount - before.characterCount).toBe(0)
  })
})
