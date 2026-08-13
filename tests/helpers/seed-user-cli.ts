import { getPayload, type Payload } from "payload"
import { getPlatformProxy } from "wrangler"

import { testUser } from "./seed-user.js"

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

  await payload.delete({
    collection: "users",
    where: { email: { equals: testUser.email } },
  })
  await payload.create({
    collection: "users",
    data: { ...testUser, roles: ["admin"] },
  })
} finally {
  await payload?.destroy()
  await platform.dispose()
}
