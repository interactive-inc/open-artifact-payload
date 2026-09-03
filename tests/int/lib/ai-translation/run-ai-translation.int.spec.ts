import { getPayload, type Payload } from "payload"
import { beforeAll, describe, expect, it } from "vite-plus/test"

import { sql } from "@payloadcms/db-d1-sqlite"

import config from "@/payload.config"
import { expireStalePendingLogs } from "@/core/lib/ai-translation/expire-stale-pending-logs"
import { loadUsageSnapshot } from "@/core/lib/ai-translation/load-usage-snapshot"
import { runAiTranslation } from "@/core/lib/ai-translation/run-ai-translation"
import type { TranslateFn } from "@/core/lib/ai-translation/translation-types"
import type { User } from "@/payload-types"

let payload: Payload
let admin: User
let newsId: string

const fakeTranslateFn: TranslateFn = (request) =>
  Promise.resolve({
    translations: request.units.map((unit) => `EN:${unit}`),
    inputTokens: 10,
    outputTokens: 5,
  })

const buildLexicalBody = (text: string) => ({
  root: {
    type: "root",
    children: [
      {
        type: "paragraph",
        version: 1,
        children: [{ type: "text", text, version: 1 }],
      },
    ],
    direction: null,
    format: "" as const,
    indent: 0,
    version: 1,
  },
})

const enableSettings = async (overrides?: {
  monthlyRunLimit?: number
  monthlyCostLimitUsd?: number
  cooldownSeconds?: number
}) => {
  await payload.updateGlobal({
    slug: "ai-translation-settings",
    data: {
      enabled: true,
      model: "anthropic/claude-haiku-4-5",
      limits: {
        monthlyRunLimit: overrides?.monthlyRunLimit ?? 10000,
        monthlyCharacterLimit: 10000000,
        monthlyCostLimitUsd: overrides?.monthlyCostLimitUsd ?? 10000,
        perRunCharacterLimit: 100000,
        cooldownSeconds: overrides?.cooldownSeconds ?? 0,
      },
    },
  })
}

// 並行実行の判定が終わるまで予約行を pending のまま保つ
const slowTranslateFn: TranslateFn = async (request) => {
  await new Promise((resolve) => setTimeout(resolve, 100))

  return {
    translations: request.units.map((unit) => `EN-CONCURRENT:${unit}`),
    inputTokens: 10,
    outputTokens: 5,
  }
}

const createTranslationTarget = async (suffix: string) => {
  const created = await payload.create({
    collection: "news",
    data: {
      title: "お知らせタイトル",
      slug: `run-ai-${suffix}-${Date.now()}`,
      publishedAt: new Date().toISOString(),
      category: "info",
      body: buildLexicalBody("本文です"),
      _status: "published",
    },
    locale: "ja",
  })

  return String(created.id)
}

const runConcurrently = async (targetId: string) => {
  return await Promise.all(
    Array.from({ length: 5 }, () =>
      runAiTranslation({
        payload,
        user: admin,
        request: {
          targetKind: "collection",
          targetSlug: "news",
          targetId,
          targetLocale: "en",
          overwrite: true,
        },
        translateFn: slowTranslateFn,
      }),
    ),
  )
}

const findLogsByStatus = async (targetId: string, status: string) => {
  const logs = await payload.find({
    collection: "ai-translation-logs",
    where: { and: [{ targetId: { equals: targetId } }, { status: { equals: status } }] },
    pagination: false,
    depth: 0,
  })

  return logs.docs
}

const readMonthlySnapshot = async () => {
  const snapshot = await loadUsageSnapshot({
    payload,
    userId: null,
    targetKind: null,
    targetSlug: null,
    targetId: null,
    targetLocale: null,
    beforeLogId: null,
    now: new Date(),
  })

  if (snapshot instanceof Error) throw snapshot

  return snapshot
}

describe("runAiTranslation", () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })

    admin = await payload.create({
      collection: "users",
      data: {
        email: `run-ai-${Date.now()}@example.com`,
        password: "test-password-1234",
        roles: ["admin"],
      },
    })

    const created = await payload.create({
      collection: "news",
      data: {
        title: "お知らせタイトル",
        slug: `run-ai-${Date.now()}`,
        publishedAt: new Date().toISOString(),
        category: "info",
        body: buildLexicalBody("本文です"),
        _status: "published",
      },
      locale: "ja",
    })

    newsId = String(created.id)
  })

  it("設定が無効なら Error を返し何も保存しない", async () => {
    await payload.updateGlobal({
      slug: "ai-translation-settings",
      data: { enabled: false },
    })

    const outcome = await runAiTranslation({
      payload,
      user: admin,
      request: {
        targetKind: "collection",
        targetSlug: "news",
        targetId: newsId,
        targetLocale: "en",
        overwrite: false,
      },
      translateFn: fakeTranslateFn,
    })

    expect(outcome).toBeInstanceOf(Error)
    if (outcome instanceof Error) expect(outcome.message).toContain("無効")
  })

  it("未入力の localized フィールドを翻訳して翻訳先 locale に保存する", async () => {
    await enableSettings()

    const outcome = await runAiTranslation({
      payload,
      user: admin,
      request: {
        targetKind: "collection",
        targetSlug: "news",
        targetId: newsId,
        targetLocale: "en",
        overwrite: false,
      },
      translateFn: fakeTranslateFn,
    })

    if (outcome instanceof Error) throw outcome

    expect(outcome.status).toBe("succeeded")
    expect(outcome.translatedFieldCount).toBeGreaterThanOrEqual(2)

    const enDoc = await payload.findByID({
      collection: "news",
      id: newsId,
      locale: "en",
      fallbackLocale: false,
      draft: true,
      depth: 0,
    })

    expect(enDoc.title).toBe("EN:お知らせタイトル")
    expect(JSON.stringify(enDoc.body)).toContain("EN:本文です")

    const jaDoc = await payload.findByID({
      collection: "news",
      id: newsId,
      locale: "ja",
      fallbackLocale: false,
      draft: true,
      depth: 0,
    })

    expect(jaDoc.title).toBe("お知らせタイトル")

    const logs = await payload.find({
      collection: "ai-translation-logs",
      where: {
        and: [{ targetId: { equals: newsId } }, { status: { equals: "succeeded" } }],
      },
      sort: "-createdAt",
      limit: 1,
      depth: 0,
    })

    const log = logs.docs[0]

    expect(log).toBeDefined()
    expect(log?.executedBy).toBe(admin.id)
    expect(log?.characterCount).toBe("お知らせタイトル".length + "本文です".length)
    expect(log?.estimatedCostUsd).toBeGreaterThan(0)
  })

  it("入力済みフィールドは overwrite=false ではスキップされる", async () => {
    await enableSettings()

    const outcome = await runAiTranslation({
      payload,
      user: admin,
      request: {
        targetKind: "collection",
        targetSlug: "news",
        targetId: newsId,
        targetLocale: "en",
        overwrite: false,
      },
      translateFn: (request) =>
        Promise.resolve({
          translations: request.units.map((unit) => `EN2:${unit}`),
          inputTokens: 10,
          outputTokens: 5,
        }),
    })

    if (outcome instanceof Error) throw outcome

    expect(outcome.status).toBe("skipped")

    const enDoc = await payload.findByID({
      collection: "news",
      id: newsId,
      locale: "en",
      fallbackLocale: false,
      draft: true,
      depth: 0,
    })

    expect(enDoc.title).toBe("EN:お知らせタイトル")
  })

  it("overwrite=true なら既存翻訳を上書きする", async () => {
    await enableSettings()

    const outcome = await runAiTranslation({
      payload,
      user: admin,
      request: {
        targetKind: "collection",
        targetSlug: "news",
        targetId: newsId,
        targetLocale: "en",
        overwrite: true,
      },
      translateFn: (request) =>
        Promise.resolve({
          translations: request.units.map((unit) => `EN2:${unit}`),
          inputTokens: 10,
          outputTokens: 5,
        }),
    })

    if (outcome instanceof Error) throw outcome

    expect(outcome.status).toBe("succeeded")

    const enDoc = await payload.findByID({
      collection: "news",
      id: newsId,
      locale: "en",
      fallbackLocale: false,
      draft: true,
      depth: 0,
    })

    expect(enDoc.title).toBe("EN2:お知らせタイトル")
  })

  it("月間実行回数の上限に達していると rejected ログを残して Error", async () => {
    await enableSettings({ monthlyRunLimit: 0 })

    const outcome = await runAiTranslation({
      payload,
      user: admin,
      request: {
        targetKind: "collection",
        targetSlug: "news",
        targetId: newsId,
        targetLocale: "en",
        overwrite: true,
      },
      translateFn: fakeTranslateFn,
    })

    expect(outcome).toBeInstanceOf(Error)
    if (outcome instanceof Error) expect(outcome.message).toContain("回数")

    const logs = await payload.find({
      collection: "ai-translation-logs",
      where: {
        and: [{ targetId: { equals: newsId } }, { status: { equals: "rejected" } }],
      },
      sort: "-createdAt",
      limit: 1,
      depth: 0,
    })

    expect(logs.docs[0]).toBeDefined()
  })

  it("翻訳結果の件数不一致は failed ログを残し、既存データを変更しない", async () => {
    await enableSettings()

    const outcome = await runAiTranslation({
      payload,
      user: admin,
      request: {
        targetKind: "collection",
        targetSlug: "news",
        targetId: newsId,
        targetLocale: "en",
        overwrite: true,
      },
      translateFn: () =>
        Promise.resolve({ translations: ["only-one"], inputTokens: 1, outputTokens: 1 }),
    })

    expect(outcome).toBeInstanceOf(Error)

    const enDoc = await payload.findByID({
      collection: "news",
      id: newsId,
      locale: "en",
      fallbackLocale: false,
      draft: true,
      depth: 0,
    })

    expect(enDoc.title).toBe("EN2:お知らせタイトル")

    const logs = await payload.find({
      collection: "ai-translation-logs",
      where: {
        and: [{ targetId: { equals: newsId } }, { status: { equals: "failed" } }],
      },
      sort: "-createdAt",
      limit: 1,
      depth: 0,
    })

    expect(logs.docs[0]).toBeDefined()
  })

  it("更新権限が無いユーザーは AI を呼ぶ前に拒否される（site-settings は editor 更新不可）", async () => {
    await enableSettings()
    await payload.updateGlobal({
      slug: "site-settings",
      locale: "ja",
      data: { siteName: "権限確認用サイト" },
    })

    const editor = await payload.create({
      collection: "users",
      data: {
        email: `run-ai-editor-${Date.now()}@example.com`,
        password: "test-password-1234",
        roles: ["editor"],
      },
    })

    const calls: string[] = []

    const outcome = await runAiTranslation({
      payload,
      user: editor,
      request: {
        targetKind: "global",
        targetSlug: "site-settings",
        targetId: null,
        targetLocale: "en",
        overwrite: true,
      },
      translateFn: (request) => {
        calls.push("called")
        return Promise.resolve({
          translations: request.units.map((unit) => `EN:${unit}`),
          inputTokens: 1,
          outputTokens: 1,
        })
      },
    })

    expect(outcome).toBeInstanceOf(Error)
    if (outcome instanceof Error) expect(outcome.message).toContain("権限")
    expect(calls).toHaveLength(0)
  })

  it("実行中は pending の予約ログが存在し、完了後に同じ行が succeeded になる", async () => {
    await enableSettings()

    const pendingSeen: number[] = []
    const pendingReservedCosts: number[] = []

    const outcome = await runAiTranslation({
      payload,
      user: admin,
      request: {
        targetKind: "collection",
        targetSlug: "news",
        targetId: newsId,
        targetLocale: "en",
        overwrite: true,
      },
      translateFn: async (request) => {
        const pendingLogs = await payload.find({
          collection: "ai-translation-logs",
          where: {
            and: [{ targetId: { equals: newsId } }, { status: { equals: "pending" } }],
          },
          limit: 5,
          depth: 0,
        })
        pendingSeen.push(...pendingLogs.docs.map((log) => log.id))
        pendingReservedCosts.push(...pendingLogs.docs.map((log) => log.estimatedCostUsd ?? 0))

        return {
          translations: request.units.map((unit) => `EN4:${unit}`),
          inputTokens: 10,
          outputTokens: 5,
        }
      },
    })

    if (outcome instanceof Error) throw outcome

    expect(pendingSeen).toHaveLength(1)
    // 費用も見込み額で予約され、並行リクエストの費用上限判定に含まれる
    expect(pendingReservedCosts[0]).toBeGreaterThan(0)

    const finalizedLog = await payload.findByID({
      collection: "ai-translation-logs",
      id: pendingSeen[0] ?? 0,
      depth: 0,
    })

    expect(finalizedLog.status).toBe("succeeded")
    expect(finalizedLog.estimatedCostUsd).toBeGreaterThan(0)
  })

  it("AI 呼び出し中に翻訳先が編集されたら保存を中止する（楽観ロック）", async () => {
    await enableSettings()

    const outcome = await runAiTranslation({
      payload,
      user: admin,
      request: {
        targetKind: "collection",
        targetSlug: "news",
        targetId: newsId,
        targetLocale: "en",
        overwrite: true,
      },
      translateFn: async (request) => {
        // 翻訳 API の応答待ちの間に他の編集者が翻訳先を更新した状況を再現する
        await payload.update({
          collection: "news",
          id: newsId,
          data: { title: "CONCURRENT-EDIT" },
          locale: "en",
          draft: true,
          depth: 0,
        })

        return {
          translations: request.units.map((unit) => `EN3:${unit}`),
          inputTokens: 10,
          outputTokens: 5,
        }
      },
    })

    expect(outcome).toBeInstanceOf(Error)
    if (outcome instanceof Error) expect(outcome.message).toContain("更新された")

    const enDoc = await payload.findByID({
      collection: "news",
      id: newsId,
      locale: "en",
      fallbackLocale: false,
      draft: true,
      depth: 0,
    })

    expect(enDoc.title).toBe("CONCURRENT-EDIT")
  })

  it("翻訳先言語が defaultLocale や未定義の locale なら Error", async () => {
    await enableSettings()

    const toJa = await runAiTranslation({
      payload,
      user: admin,
      request: {
        targetKind: "collection",
        targetSlug: "news",
        targetId: newsId,
        targetLocale: "ja",
        overwrite: false,
      },
      translateFn: fakeTranslateFn,
    })

    expect(toJa).toBeInstanceOf(Error)

    const toUnknown = await runAiTranslation({
      payload,
      user: admin,
      request: {
        targetKind: "collection",
        targetSlug: "news",
        targetId: newsId,
        targetLocale: "fr",
        overwrite: false,
      },
      translateFn: fakeTranslateFn,
    })

    expect(toUnknown).toBeInstanceOf(Error)
  })

  it("同時に実行しても月間実行回数の上限を超えない", async () => {
    const targetId = await createTranslationTarget("concurrent-runs")

    // 失効した予約を先に回収し、残枠の測定と判定で同じ集計を見るようにする
    await expireStalePendingLogs({ payload, now: new Date() })

    const before = await readMonthlySnapshot()

    await enableSettings({ monthlyRunLimit: before.monthlyRunCount + 1 })

    const outcomes = await runConcurrently(targetId)
    const errors = outcomes.filter((outcome) => outcome instanceof Error)

    expect(outcomes.length - errors.length).toBe(1)
    expect(errors).toHaveLength(4)

    for (const error of errors) {
      expect(error.message).toContain("回数")
    }

    expect(await findLogsByStatus(targetId, "succeeded")).toHaveLength(1)
    expect(await findLogsByStatus(targetId, "rejected")).toHaveLength(4)
    expect(await findLogsByStatus(targetId, "pending")).toHaveLength(0)
  })

  it("同時に実行しても月間費用上限を超えない", async () => {
    await enableSettings()

    const probeTargetId = await createTranslationTarget("concurrent-cost-probe")
    let reservedCostUsd = 0

    // 予約時の見込み費用（プロンプト分を含む）を実測してから上限を決める
    const probe = await runAiTranslation({
      payload,
      user: admin,
      request: {
        targetKind: "collection",
        targetSlug: "news",
        targetId: probeTargetId,
        targetLocale: "en",
        overwrite: true,
      },
      translateFn: async (request) => {
        const pendingLogs = await findLogsByStatus(probeTargetId, "pending")
        reservedCostUsd = pendingLogs[0]?.estimatedCostUsd ?? 0

        return {
          translations: request.units.map((unit) => `EN-PROBE:${unit}`),
          inputTokens: 10,
          outputTokens: 5,
        }
      },
    })

    if (probe instanceof Error) throw probe

    expect(reservedCostUsd).toBeGreaterThan(0)

    await expireStalePendingLogs({ payload, now: new Date() })

    const before = await readMonthlySnapshot()

    // 1 件分は通るが 2 件分は通らない上限
    await enableSettings({ monthlyCostLimitUsd: before.monthlyCostUsd + reservedCostUsd * 1.5 })

    const targetId = await createTranslationTarget("concurrent-cost")
    const outcomes = await runConcurrently(targetId)
    const errors = outcomes.filter((outcome) => outcome instanceof Error)

    expect(outcomes.length - errors.length).toBe(1)
    expect(errors).toHaveLength(4)

    for (const error of errors) {
      expect(error.message).toContain("費用")
    }

    expect(await findLogsByStatus(targetId, "succeeded")).toHaveLength(1)
    expect(await findLogsByStatus(targetId, "pending")).toHaveLength(0)
  })

  it("同時に実行してもクールダウンをすり抜けられない", async () => {
    await enableSettings({ cooldownSeconds: 60 })

    const targetId = await createTranslationTarget("concurrent-cooldown")
    const outcomes = await runConcurrently(targetId)
    const errors = outcomes.filter((outcome) => outcome instanceof Error)

    expect(outcomes.length - errors.length).toBe(1)
    expect(errors).toHaveLength(4)

    for (const error of errors) {
      expect(error.message).toContain("連続実行")
    }

    expect(await findLogsByStatus(targetId, "succeeded")).toHaveLength(1)
    expect(await findLogsByStatus(targetId, "pending")).toHaveLength(0)
  })

  it("失効した pending 予約は failed へ回収され、費用として集計に残る", async () => {
    await enableSettings()

    const staleTargetId = await createTranslationTarget("stale-pending")
    const staleLog = await payload.create({
      collection: "ai-translation-logs",
      data: {
        targetKind: "collection",
        targetSlug: "news",
        targetId: staleTargetId,
        targetTitle: "stale-pending-test",
        executedBy: admin.id,
        sourceLocale: "ja",
        targetLocale: "en",
        model: "anthropic/claude-haiku-4-5",
        status: "pending",
        characterCount: 120,
        estimatedCostUsd: 1.25,
      },
    })

    // 11 分前に予約されたまま確定しなかった行を再現する
    const staleCreatedAtIso = new Date(Date.now() - 11 * 60 * 1000).toISOString()

    await payload.db.drizzle.run(
      sql`UPDATE ai_translation_logs SET created_at = ${staleCreatedAtIso} WHERE id = ${staleLog.id}`,
    )

    const before = await readMonthlySnapshot()
    const outcome = await runAiTranslation({
      payload,
      user: admin,
      request: {
        targetKind: "collection",
        targetSlug: "news",
        targetId: await createTranslationTarget("stale-trigger"),
        targetLocale: "en",
        overwrite: true,
      },
      translateFn: fakeTranslateFn,
    })

    if (outcome instanceof Error) throw outcome

    const recovered = await payload.findByID({
      collection: "ai-translation-logs",
      id: staleLog.id,
      depth: 0,
    })

    expect(recovered.status).toBe("failed")
    expect(recovered.errorMessage).toContain("失効")
    expect(recovered.estimatedCostUsd).toBe(1.25)

    // 失効前は集計から外れ、回収後は実費として数える
    const after = await readMonthlySnapshot()

    expect(after.monthlyCostUsd - before.monthlyCostUsd).toBeGreaterThanOrEqual(1.25)
  })
})
