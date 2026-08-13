import { execFile } from "node:child_process"
import { promisify } from "node:util"

import { assertCloudflareAccountId } from "@/core/scripts/cloudflare-config"
import { assertSlug } from "@/core/scripts/slug"

const execFileAsync = promisify(execFile)

export async function createR2Bucket(slug: string, accountId: string): Promise<void> {
  assertSlug(slug)
  assertCloudflareAccountId(accountId)
  await execFileAsync("vp", ["exec", "wrangler", "r2", "bucket", "create", `${slug}-cms`], {
    env: { ...process.env, CLOUDFLARE_ACCOUNT_ID: accountId },
  })
}
