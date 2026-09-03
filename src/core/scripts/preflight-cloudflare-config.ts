import { readFile } from "node:fs/promises"
import path from "node:path"

import { getCloudflareConfigIssues } from "@/core/scripts/cloudflare-config"
import { getCliOption } from "@/core/scripts/get-cli-option"

async function main(): Promise<void> {
  const environment = getCliOption("env")
  if (!environment) {
    throw new Error("デプロイ対象を --env=<environment> で明示してください")
  }

  const configPath = path.resolve(getCliOption("config") ?? "wrangler.jsonc")
  const source = await readFile(configPath, "utf8")
  const issues = getCloudflareConfigIssues({
    source,
    environment,
    accountIdFromEnvironment: process.env.CLOUDFLARE_ACCOUNT_ID,
  })
  if (issues.length > 0) {
    throw new Error(`Cloudflare デプロイ設定を確認してください:\n- ${issues.join("\n- ")}`)
  }

  console.log(`Cloudflare env.${environment} のデプロイ設定を確認しました。`)
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
