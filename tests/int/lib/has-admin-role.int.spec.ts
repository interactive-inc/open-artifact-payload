import { describe, expect, it } from "vite-plus/test"

import { hasAdminRole } from "@/core/lib/access/has-admin-role"

describe("hasAdminRole", () => {
  it("null は admin ではないので false を返す", () => {
    expect(hasAdminRole(null)).toBe(false)
  })

  it("undefined は admin ではないので false を返す", () => {
    expect(hasAdminRole(undefined)).toBe(false)
  })

  it("空オブジェクトは roles を持たないので false を返す", () => {
    expect(hasAdminRole({})).toBe(false)
  })

  it("roles が null の場合は false を返す", () => {
    expect(hasAdminRole({ roles: null })).toBe(false)
  })

  it("roles が配列でない文字列 admin の場合は false を返す", () => {
    expect(hasAdminRole({ roles: "admin" })).toBe(false)
  })

  it("roles が editor のみの配列の場合は false を返す", () => {
    expect(hasAdminRole({ roles: ["editor"] })).toBe(false)
  })

  it("roles に admin を含む配列の場合は true を返す", () => {
    expect(hasAdminRole({ roles: ["admin"] })).toBe(true)
  })

  it("roles に admin と editor の両方を含む配列の場合は true を返す", () => {
    expect(hasAdminRole({ roles: ["admin", "editor"] })).toBe(true)
  })
})
