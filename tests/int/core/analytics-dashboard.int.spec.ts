import { getPayload, type Payload } from "payload"
import { beforeAll, describe, expect, it } from "vite-plus/test"

import config from "@/payload.config"
import { loadAnalyticsDashboard } from "@/core/lib/analytics/load-analytics-dashboard"
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
