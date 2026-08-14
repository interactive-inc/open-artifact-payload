import { getPayload, type Payload } from "payload"
import { beforeAll, describe, expect, it } from "vite-plus/test"

import config from "@/payload.config"
import type { User } from "@/payload-types"

let payload: Payload
let serviceAdmin: User
let clientAdmin: User

const createUser = async (roles: ("admin" | "editor" | "serviceAdmin")[]) =>
  payload.create({
    collection: "users",
    data: {
      email: `svc-role-${roles.join("-")}-${Date.now()}@example.com`,
      password: "test-password-1234",
      roles,
    },
  })

describe("serviceAdmin ロール", () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })

    // 内部処理（req.user なし）は付与できる = 初期セットアップの経路
    serviceAdmin = await createUser(["admin", "serviceAdmin"])
    clientAdmin = await createUser(["admin"])
  })

  it("クライアント admin は serviceAdmin を付与できない", async () => {
    const target = await createUser(["editor"])

    await expect(
      payload.update({
        collection: "users",
        id: target.id,
        data: { roles: ["editor", "serviceAdmin"] },
        overrideAccess: false,
        user: clientAdmin,
      }),
    ).rejects.toThrow()
  })

  it("クライアント admin は serviceAdmin を剥奪できない", async () => {
    await expect(
      payload.update({
        collection: "users",
        id: serviceAdmin.id,
        data: { roles: ["admin"] },
        overrideAccess: false,
        user: clientAdmin,
      }),
    ).rejects.toThrow()
  })

  it("クライアント admin は serviceAdmin のパスワード・メールを変更できない（乗っ取り防止）", async () => {
    await expect(
      payload.update({
        collection: "users",
        id: serviceAdmin.id,
        data: { password: "hijacked-password-1234" },
        overrideAccess: false,
        user: clientAdmin,
      }),
    ).rejects.toThrow()
  })

  it("クライアント admin は serviceAdmin アカウントを削除できない", async () => {
    await expect(
      payload.delete({
        collection: "users",
        id: serviceAdmin.id,
        overrideAccess: false,
        user: clientAdmin,
      }),
    ).rejects.toThrow()
  })

  it("serviceAdmin 単独のロールでも AI翻訳ログを閲覧できる", async () => {
    const serviceOnly = await createUser(["serviceAdmin"])

    const logs = await payload.find({
      collection: "ai-translation-logs",
      limit: 1,
      depth: 0,
      overrideAccess: false,
      user: serviceOnly,
    })

    expect(logs.totalDocs).toBeGreaterThanOrEqual(0)
  })

  it("serviceAdmin は付与できる", async () => {
    const target = await createUser(["editor"])

    const updated = await payload.update({
      collection: "users",
      id: target.id,
      data: { roles: ["editor", "serviceAdmin"] },
      overrideAccess: false,
      user: serviceAdmin,
    })

    expect(updated.roles).toContain("serviceAdmin")
  })

  it("serviceAdmin 以外は ai-translation-settings を更新できない", async () => {
    await expect(
      payload.updateGlobal({
        slug: "ai-translation-settings",
        data: { enabled: false },
        overrideAccess: false,
        user: clientAdmin,
      }),
    ).rejects.toThrow()
  })

  it("serviceAdmin は ai-translation-settings を更新できる", async () => {
    const updated = await payload.updateGlobal({
      slug: "ai-translation-settings",
      data: {
        enabled: false,
        model: "anthropic/claude-haiku-4-5",
        limits: {
          monthlyRunLimit: 100,
          monthlyCharacterLimit: 300000,
          monthlyCostLimitUsd: 10,
          perRunCharacterLimit: 20000,
          cooldownSeconds: 30,
        },
      },
      overrideAccess: false,
      user: serviceAdmin,
    })

    expect(updated.enabled).toBe(false)
  })

  it("クライアント admin はログの推定API費用を読めない", async () => {
    const created = await payload.create({
      collection: "ai-translation-logs",
      data: {
        targetKind: "collection",
        targetSlug: "news",
        targetTitle: "費用マスクの検証",
        sourceLocale: "ja",
        targetLocale: "en",
        model: "anthropic/claude-haiku-4-5",
        status: "succeeded",
        characterCount: 10,
        estimatedCostUsd: 0.5,
      },
    })

    const asClientAdmin = await payload.findByID({
      collection: "ai-translation-logs",
      id: created.id,
      overrideAccess: false,
      user: clientAdmin,
      depth: 0,
    })

    expect(asClientAdmin.estimatedCostUsd ?? null).toBeNull()
    expect(asClientAdmin.characterCount).toBe(10)

    const asServiceAdmin = await payload.findByID({
      collection: "ai-translation-logs",
      id: created.id,
      overrideAccess: false,
      user: serviceAdmin,
      depth: 0,
    })

    expect(asServiceAdmin.estimatedCostUsd).toBe(0.5)
  })
})
