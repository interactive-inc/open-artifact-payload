import { getPayload, type Payload } from "payload"
import { afterAll, beforeAll, describe, expect, it } from "vite-plus/test"

import config from "@/payload.config"
import { loadAnalyticsDashboard } from "@/core/lib/analytics/load-analytics-dashboard"
import { loadCanViewAnalytics } from "@/core/lib/analytics/load-can-view-analytics"
import type { User } from "@/payload-types"

let payload: Payload
let clientAdmin: User
let editor: User

const createUser = async (roles: ("admin" | "editor")[]) =>
  payload.create({
    collection: "users",
    data: {
      email: `analytics-dashboard-${roles.join("-")}-${crypto.randomUUID()}@example.com`,
      password: "test-password-1234",
      roles,
    },
  })

const loadFor = (user: User | null) =>
  loadAnalyticsDashboard({
    payload,
    user,
    range: "7d",
    now: new Date("2026-10-14T03:00:00Z"),
    fetcher: async () => {
      throw new Error("GA4 に問い合わせてはいけない")
    },
    serviceAccountJson: undefined,
  })

describe("loadAnalyticsDashboard", () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
    clientAdmin = await createUser(["admin"])
    editor = await createUser(["editor"])
    await payload.updateGlobal({
      slug: "analytics-settings",
      data: { propertyId: "123456789", viewerRoles: ["admin"] },
    })
  })

  afterAll(async () => {
    // 他のテストファイルが既定値を前提にできるよう、変えた設定を戻す
    await payload.updateGlobal({
      slug: "analytics-settings",
      data: { propertyId: null, viewerRoles: ["admin"] },
    })
  })

  it("描画の前に、パネルを出してよいかを設定のロールで判定する", async () => {
    expect(await loadCanViewAnalytics({ payload, user: clientAdmin })).toBe(true)
    expect(await loadCanViewAnalytics({ payload, user: editor })).toBe(false)
    expect(await loadCanViewAnalytics({ payload, user: null })).toBe(false)
  })

  it("見られないロールには何も用意しない", async () => {
    expect(await loadFor(editor)).toBeNull()
    expect(await loadFor(null)).toBeNull()
  })

  it("見られるロールには期間・GA4 の状態・問い合わせ件数を用意する", async () => {
    const dashboard = await loadFor(clientAdmin)

    if (dashboard === null || dashboard instanceof Error) throw new Error("dashboard missing")
    expect(dashboard.period.current).toEqual({ startDate: "2026-10-07", endDate: "2026-10-13" })
    expect(dashboard.trafficState).toEqual({ status: "not-configured" })
    expect(dashboard.inquiries?.daily).toHaveLength(7)
  })

  it("編集者を見られるロールに加えると編集者にも用意する", async () => {
    await payload.updateGlobal({
      slug: "analytics-settings",
      data: { viewerRoles: ["admin", "editor"] },
    })

    expect(await loadFor(editor)).not.toBeNull()
  })
})
