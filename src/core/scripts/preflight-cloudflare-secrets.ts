import { execFile } from "node:child_process"
import { promisify } from "node:util"

import { evaluateCloudflareSecrets } from "@/core/scripts/evaluate-cloudflare-secrets"
import { getCliOption } from "@/core/scripts/get-cli-option"

const execFileAsync = promisify(execFile)

// 初回デプロイ前は Worker 自体が存在しないため、secret 一覧を取得できない
const SCRIPT_NOT_FOUND_CODE = "10007"

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

/**
 * `wrangler secret list --format json` の出力から secret 名だけを取り出す。
 *
 * wrangler がバナー行を混ぜて出力することがあるため、最初の JSON 配列だけを解析する。
 */
function readSecretNames(output: string): string[] {
  const start = output.indexOf("[")
  const end = output.lastIndexOf("]")
  if (start < 0 || end < start) {
    throw new Error("wrangler secret list の出力を解析できません")
  }

  const parsed: unknown = JSON.parse(output.slice(start, end + 1))
  if (!Array.isArray(parsed)) {
    throw new Error("wrangler secret list の出力が配列ではありません")
  }

  return parsed.flatMap((entry) => {
    if (!isObject(entry)) return []
    if (typeof entry.name !== "string") return []

    return [entry.name]
  })
}

async function listSecretNames(environment: string): Promise<string[] | undefined> {
  try {
    const completed = await execFileAsync("wrangler", [
      "secret",
      "list",
      "--env",
      environment,
      "--format",
      "json",
    ])

    return readSecretNames(completed.stdout)
  } catch (error) {
    const details = error instanceof Error ? error.message : String(error)
    if (details.includes(SCRIPT_NOT_FOUND_CODE)) {
      console.warn(
        `Worker が未作成のため env.${environment} の secret を検査できませんでした。初回デプロイ後に再実行してください。`,
      )
      return undefined
    }
    throw new Error(`wrangler secret list --env ${environment} に失敗しました:\n${details}`)
  }
}

async function main(): Promise<void> {
  const environment = getCliOption("env")
  if (!environment) {
    throw new Error("デプロイ対象を --env=<environment> で明示してください")
  }

  const registeredNames = await listSecretNames(environment)
  if (!registeredNames) return

  const evaluation = evaluateCloudflareSecrets({ registeredNames })
  if (evaluation.missingOptional.length > 0) {
    console.warn(
      `env.${environment} に未登録の任意 secret があります (使う機能だけ登録してください):\n- ${evaluation.missingOptional.join("\n- ")}`,
    )
  }
  if (evaluation.missingRequired.length > 0) {
    throw new Error(
      `env.${environment} に必須 secret が登録されていません:\n- ${evaluation.missingRequired.join("\n- ")}\n\`wrangler secret put <NAME> --env=${environment}\` で登録してください。`,
    )
  }

  console.log(`Cloudflare env.${environment} の必須 secret を確認しました。`)
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
