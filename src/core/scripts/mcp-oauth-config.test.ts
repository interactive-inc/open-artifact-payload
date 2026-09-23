import { describe, expect, it } from "vite-plus/test"
import { getCloudflareConfigIssues } from "./cloudflare-config"

function issues(overrides: Record<string, unknown>, sibling?: Record<string, unknown>) {
  const oauth = {
    vars: { MCP_OAUTH_ENABLED: "true", NEXT_PUBLIC_SERVER_URL: "https://cms.example" },
    kv_namespaces: [{ binding: "OAUTH_KV", id: "a".repeat(32) }],
    ratelimits: [{ name: "OAUTH_RATE_LIMITER" }],
    ...overrides,
  }
  return getCloudflareConfigIssues({
    source: JSON.stringify({ env: { staging: oauth, production: sibling } }),
    environment: "staging",
  }).filter((issue) => /OAuth|OAUTH_KV|OAUTH_RATE_LIMITER/.test(issue))
}

describe("OAuth deployment configuration", () => {
  it("requires a dedicated KV, public canonical origin and registration rate limiter", () => {
    expect(issues({})).toEqual([])
    expect(issues({ kv_namespaces: [] })).toHaveLength(1)
    expect(issues({ ratelimits: [] })).toHaveLength(1)
    for (const origin of [
      "http://cms.example",
      "https://cms.example/path",
      "https://user:pass@cms.example",
      "",
    ]) {
      expect(
        issues({ vars: { MCP_OAUTH_ENABLED: "true", NEXT_PUBLIC_SERVER_URL: origin } }),
      ).toHaveLength(1)
    }
    expect(
      issues({}, { kv_namespaces: [{ binding: "OAUTH_KV", id: "a".repeat(32) }] }),
    ).toHaveLength(1)
  })
})
