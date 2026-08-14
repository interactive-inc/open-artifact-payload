import { describe, expect, test } from "vite-plus/test"

import { loadSiteManagementConfig } from "./load-site-management-config"

describe("loadSiteManagementConfig", () => {
  test("defaults the Payload auth collection to users", () => {
    const result = loadSiteManagementConfig({
      OPEN_ARTIFACT_ENDPOINT: "https://example.com",
      OPEN_ARTIFACT_API_KEY: "secret-key",
    })

    expect(result).not.toBeInstanceOf(Error)
    if (result instanceof Error) return
    expect(result.authentication).toEqual({
      kind: "api-key",
      apiKey: "secret-key",
      authCollection: "users",
    })
  })

  test("accepts a Payload JWT token", () => {
    const result = loadSiteManagementConfig({
      OPEN_ARTIFACT_ENDPOINT: "https://example.com",
      OPEN_ARTIFACT_TOKEN: "session-token",
    })

    expect(result).not.toBeInstanceOf(Error)
    if (result instanceof Error) return
    expect(result.authentication).toEqual({ kind: "jwt", token: "session-token" })
  })

  test("requires endpoint and authentication", () => {
    const result = loadSiteManagementConfig({})

    expect(result).toBeInstanceOf(Error)
  })

  test("rejects insecure or credential-bearing remote endpoints", () => {
    expect(
      loadSiteManagementConfig({
        OPEN_ARTIFACT_ENDPOINT: "http://cms.example.com",
        OPEN_ARTIFACT_API_KEY: "secret-key",
      }),
    ).toBeInstanceOf(Error)
    expect(
      loadSiteManagementConfig({
        OPEN_ARTIFACT_ENDPOINT: "https://user:secret@cms.example.com",
        OPEN_ARTIFACT_API_KEY: "secret-key",
      }),
    ).toBeInstanceOf(Error)
  })
})
