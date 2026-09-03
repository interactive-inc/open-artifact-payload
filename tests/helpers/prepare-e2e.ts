import { execFileSync } from "node:child_process"
import fs from "node:fs"
import path from "node:path"
import { getPayload, type Payload } from "payload"
import { getPlatformProxy } from "wrangler"

import { seedE2eFixtures } from "./e2e-fixtures.js"
import { previewMcpApiKeys, previewUser, testUser } from "./seed-user.js"

// E2E 専用のローカル D1 / R2 を毎回作り直す。開発用の .wrangler/state には触れないため、
// テストが途中で落ちても開発中のデータは汚れず、残った QA データも次回の実行で消える。
const persistPath = process.env.CLOUDFLARE_PERSIST_PATH ?? ".wrangler/state-e2e"
const persistRoot = path.resolve(process.cwd(), persistPath)

fs.rmSync(persistRoot, { recursive: true, force: true })
console.log(`[prepare-e2e] recreated local bindings at ${persistRoot}`)

// マイグレーションは payload CLI に任せる。子プロセスなので Miniflare の接続も確実に閉じる。
// payload の bin は自前で tsx を register するため、test:e2e が渡す --import=tsx/esm を
// そのまま継承すると二重登録で落ちる。NODE_OPTIONS は子プロセス用に上書きする。
execFileSync("vp", ["exec", "payload", "migrate"], {
  stdio: "inherit",
  env: {
    ...process.env,
    CLOUDFLARE_PERSIST_PATH: persistPath,
    NODE_OPTIONS: "--no-deprecation",
  },
})

// Next devと同時に別のMiniflareを開くとローカルD1が競合する。Playwrightの
// webServer起動前にユーザーとフィクスチャを作り、双方の接続を必ず閉じてからNextを起動する。
const platform = await getPlatformProxy<CloudflareEnv>({
  environment: process.env.CLOUDFLARE_ENV,
  remoteBindings: false,
  persist: { path: persistPath },
})
Reflect.set(globalThis, Symbol.for("__cloudflare-context__"), {
  env: platform.env,
  cf: platform.cf,
  ctx: platform.ctx,
})

let payload: Payload | undefined

try {
  // payload.config は上の Cloudflare コンテキストを読むため、設定後に読み込む必要がある。
  const { default: config } = await import("../../src/payload.config.js")
  payload = await getPayload({ config })

  await payload.create({
    collection: "users",
    data: { ...testUser, roles: ["admin"] },
  })
  const previewAdmin = await payload.create({
    collection: "users",
    data: { ...previewUser, roles: ["admin"] },
  })
  for (const [apiKey, expiresAt] of [
    [previewMcpApiKeys.active, "2099-01-01T00:00:00.000Z"],
    [previewMcpApiKeys.expired, "2000-01-01T00:00:00.000Z"],
  ] as const) {
    await payload.create({
      collection: "payload-mcp-api-keys",
      data: {
        user: previewAdmin.id,
        label: "Preview E2E",
        enableAPIKey: true,
        apiKey,
        expiresAt,
        news: { find: true, create: false, update: false },
      },
    })
  }

  await seedE2eFixtures(payload)
  console.log("[prepare-e2e] seeded E2E users and fixtures")
} finally {
  await payload?.destroy()
  await platform.dispose()
}
