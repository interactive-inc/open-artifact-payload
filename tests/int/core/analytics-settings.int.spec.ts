import { getPayload, type Payload } from "payload"
import { afterAll, beforeAll, describe, expect, it } from "vite-plus/test"

import config from "@/payload.config"
import { analyticsSettings } from "@/core/globals/analytics-settings"
import type { User } from "@/payload-types"

let payload: Payload
let serviceAdmin: User
let clientAdmin: User
let editor: User

const createUser = async (roles: ("admin" | "editor" | "serviceAdmin")[]) =>
  payload.create({
    collection: "users",
    data: {
      email: `analytics-${roles.join("-")}-${crypto.randomUUID()}@example.com`,
      password: "test-password-1234",
      roles,
    },
  })

describe("アクセス解析設定", () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
    serviceAdmin = await createUser(["serviceAdmin"])
    clientAdmin = await createUser(["admin"])
    editor = await createUser(["editor"])
  })

  afterAll(async () => {
    // 他のテストファイルが既定値を前提にできるよう、変えた設定を戻す
    await payload.updateGlobal({
      slug: "analytics-settings",
      data: { propertyId: null, viewerRoles: ["admin"] },
    })
  })

  it("見られるロールの既定は管理者だけ", () => {
    const viewerRoles = analyticsSettings.fields.find(
      (field) => "name" in field && field.name === "viewerRoles",
    )

    expect(viewerRoles && "defaultValue" in viewerRoles && viewerRoles.defaultValue).toEqual([
      "admin",
    ])
  })

  it("editor は設定を読めない", async () => {
    await expect(
      payload.findGlobal({ slug: "analytics-settings", overrideAccess: false, user: editor }),
    ).rejects.toThrow()
  })

  it("serviceAdmin はプロパティ ID を設定できる", async () => {
    const updated = await payload.updateGlobal({
      slug: "analytics-settings",
      data: { propertyId: "123456789" },
      overrideAccess: false,
      user: serviceAdmin,
    })

    expect(updated.propertyId).toBe("123456789")
  })

  it("admin は見られるロールを変えられるが、プロパティ ID は変えられない", async () => {
    await payload.updateGlobal({ slug: "analytics-settings", data: { propertyId: "123456789" } })

    const updated = await payload.updateGlobal({
      slug: "analytics-settings",
      data: { propertyId: "999999999", viewerRoles: ["admin", "editor"] },
      overrideAccess: false,
      user: clientAdmin,
    })

    expect(updated.viewerRoles).toEqual(["admin", "editor"])
    const stored = await payload.findGlobal({ slug: "analytics-settings" })
    expect(stored.propertyId).toBe("123456789")
  })

  it("G- から始まる測定 ID は保存できない", async () => {
    await expect(
      payload.updateGlobal({
        slug: "analytics-settings",
        data: { propertyId: "G-ABC123XYZ" },
        overrideAccess: false,
        user: serviceAdmin,
      }),
    ).rejects.toThrow()
  })
})
