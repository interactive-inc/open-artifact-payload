import { getPayload, type Payload } from "payload"
import { getPlatformProxy } from "wrangler"

import { previewMcpApiKeys, previewUser, testUser } from "./seed-user.js"

// Next devと同時に別のMiniflareを開くとローカルD1が競合する。Playwrightの
// webServer起動前に専用ユーザーを作り、双方の接続を必ず閉じてからNextを起動する。
const platform = await getPlatformProxy<CloudflareEnv>({
  environment: process.env.CLOUDFLARE_ENV,
  remoteBindings: false,
})
Reflect.set(globalThis, Symbol.for("__cloudflare-context__"), {
  env: platform.env,
  cf: platform.cf,
  ctx: platform.ctx,
})

let payload: Payload | undefined

try {
  const { default: config } = await import("../../src/payload.config.js")
  payload = await getPayload({ config })

  const existingPreviewUsers = await payload.find({
    collection: "users",
    where: { email: { equals: previewUser.email } },
  })
  for (const user of existingPreviewUsers.docs) {
    await payload.delete({
      collection: "payload-mcp-api-keys",
      where: { user: { equals: user.id } },
    })
  }

  await payload.delete({
    collection: "users",
    where: {
      or: [{ email: { equals: testUser.email } }, { email: { equals: previewUser.email } }],
    },
  })
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
} finally {
  await payload?.destroy()
  await platform.dispose()
}
