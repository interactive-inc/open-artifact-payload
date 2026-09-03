import { describe, expect, it } from "vite-plus/test"

import { resolveCloudflareContextMode } from "@/core/payload/resolve-cloudflare-context-mode"

describe("resolveCloudflareContextMode", () => {
  it("CLI かつ CLOUDFLARE_REMOTE_BINDINGS=true のときは wrangler-remote になる", () => {
    const mode = resolveCloudflareContextMode({
      isCLI: true,
      hasOpenNextContext: false,
      isRemoteBindingsRequested: true,
    })
    expect(mode).toBe("wrangler-remote")
  })

  it("CLI のみでフラグなしのときは wrangler-local になる", () => {
    const mode = resolveCloudflareContextMode({
      isCLI: true,
      hasOpenNextContext: false,
      isRemoteBindingsRequested: false,
    })
    expect(mode).toBe("wrangler-local")
  })

  it("OpenNext がコンテキストを注入済みのときは opennext になる", () => {
    const mode = resolveCloudflareContextMode({
      isCLI: false,
      hasOpenNextContext: true,
      isRemoteBindingsRequested: false,
    })
    expect(mode).toBe("opennext")
  })

  it("CLI でも OpenNext でもないときは wrangler-local になる", () => {
    const mode = resolveCloudflareContextMode({
      isCLI: false,
      hasOpenNextContext: false,
      isRemoteBindingsRequested: false,
    })
    expect(mode).toBe("wrangler-local")
  })

  it("フラグがあっても CLI でなければ wrangler-local のままになる", () => {
    const mode = resolveCloudflareContextMode({
      isCLI: false,
      hasOpenNextContext: false,
      isRemoteBindingsRequested: true,
    })
    expect(mode).toBe("wrangler-local")
  })
})
