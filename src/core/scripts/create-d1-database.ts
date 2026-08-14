import { execFile } from "node:child_process"
import { promisify } from "node:util"

import { assertCloudflareAccountId } from "@/core/scripts/cloudflare-config"
import { assertSlug } from "@/core/scripts/slug"

const execFileAsync = promisify(execFile)

export async function createD1Database(slug: string, accountId: string): Promise<string> {
  assertSlug(slug)
  assertCloudflareAccountId(accountId)
  const result = await execFileAsync("vp", ["exec", "wrangler", "d1", "create", `${slug}-cms`], {
    env: { ...process.env, CLOUDFLARE_ACCOUNT_ID: accountId },
  })
  const databaseId = result.stdout.match(/"database_id":\s*"([^"]+)"/)?.[1]
  if (!databaseId) {
    throw new Error("wrangler d1 create の出力から database_id を抽出できませんでした")
  }
  return databaseId
}
