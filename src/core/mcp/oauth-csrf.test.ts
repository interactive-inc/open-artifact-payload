import { describe, expect, it } from "vite-plus/test"
import { createOAuthCsrf, verifyOAuthCsrf } from "./oauth-csrf"

describe("OAuth consent CSRF", () => {
  it("binds consent to the user, exact authorization URL, browser cookie and same-origin POST", () => {
    const url = "https://cms.example/oauth/authorize/?client_id=client"
    const csrf = createOAuthCsrf(url, "1", "fixture-secret")
    const request = (target = url, origin = "https://cms.example", cookie = csrf.cookie) =>
      new Request(target, { method: "POST", headers: { origin, cookie } })
    expect(verifyOAuthCsrf(request(), csrf.nonce, "1", "fixture-secret")).toBe(true)
    expect(verifyOAuthCsrf(request(), csrf.nonce, "2", "fixture-secret")).toBe(false)
    expect(verifyOAuthCsrf(request(`${url}2`), csrf.nonce, "1", "fixture-secret")).toBe(false)
    expect(
      verifyOAuthCsrf(request(url, "https://attacker.example"), csrf.nonce, "1", "fixture-secret"),
    ).toBe(false)
    expect(
      verifyOAuthCsrf(request(url, "https://cms.example", ""), csrf.nonce, "1", "fixture-secret"),
    ).toBe(false)
    expect(verifyOAuthCsrf(request(), "forged", "1", "fixture-secret")).toBe(false)
    expect(verifyOAuthCsrf(request(), csrf.nonce, "1", "another-secret")).toBe(false)
  })
})
