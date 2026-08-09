import { mkdtemp, readFile, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"
import { afterEach, beforeEach, describe, expect, it } from "vite-plus/test"

import { generatePayloadSecret } from "@/core/scripts/generate-payload-secret"
import { writeEnvFile } from "@/core/scripts/write-env"

describe("write-env", () => {
  let dir: string

  beforeEach(async () => {
    dir = await mkdtemp(path.join(tmpdir(), "ictms-"))
  })

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true })
  })

  it("新しい .env に PAYLOAD_SECRET を書き込む", async () => {
    const envPath = path.join(dir, ".env")
    await writeEnvFile({
      envPath,
      payloadSecret: "fixed-secret",
      serverUrl: "http://localhost:3000",
    })
    const content = await readFile(envPath, "utf8")
    expect(content).toContain("PAYLOAD_SECRET=fixed-secret")
    expect(content).toContain("NEXT_PUBLIC_SERVER_URL=http://localhost:3000")
  })

  it("generatePayloadSecret は 64 文字の hex を返す", () => {
    const secret = generatePayloadSecret()
    expect(secret).toMatch(/^[0-9a-f]{64}$/)
  })
})
