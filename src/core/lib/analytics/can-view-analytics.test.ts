import { describe, expect, it } from "vite-plus/test"

import { canViewAnalytics } from "@/core/lib/analytics/can-view-analytics"

const user = (roles: string[]) => ({ id: 1, roles })

describe("canViewAnalytics", () => {
  it("サービス管理者は設定に関係なく見られる", () => {
    expect(canViewAnalytics({ user: user(["serviceAdmin"]), viewerRoles: [] })).toBe(true)
  })

  it("選ばれたロールを持つユーザーだけが見られる", () => {
    expect(canViewAnalytics({ user: user(["admin"]), viewerRoles: ["admin"] })).toBe(true)
    expect(canViewAnalytics({ user: user(["editor"]), viewerRoles: ["admin"] })).toBe(false)
    expect(canViewAnalytics({ user: user(["editor"]), viewerRoles: ["admin", "editor"] })).toBe(
      true,
    )
  })

  it("何も選ばれていなければサービス管理者だけ", () => {
    expect(canViewAnalytics({ user: user(["admin"]), viewerRoles: [] })).toBe(false)
  })

  it("ログインしていない、またはロールを持たないユーザーは見られない", () => {
    expect(canViewAnalytics({ user: null, viewerRoles: ["admin", "editor"] })).toBe(false)
    expect(canViewAnalytics({ user: { id: 1 }, viewerRoles: ["admin", "editor"] })).toBe(false)
  })
})
