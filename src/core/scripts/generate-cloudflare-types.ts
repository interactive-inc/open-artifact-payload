import { spawn } from "node:child_process"
import { readFile, rm, writeFile } from "node:fs/promises"

import { applyEdits, modify } from "jsonc-parser"

import { getCliOption } from "@/core/scripts/get-cli-option"

const SOURCE_CONFIG_PATH = "wrangler.jsonc"
const TYPES_CONFIG_PATH = ".wrangler-types.jsonc"
const OUTPUT_PATH = "cloudflare-env.d.ts"
const ENV_FILE_PATH = ".env.example"
const ENV_INTERFACE = "CloudflareEnv"

function runWrangler(args: ReadonlyArray<string>): Promise<number> {
  return new Promise((resolve) => {
    const child = spawn("wrangler", [...args], { stdio: "inherit" })
    child.on("error", (error) => {
      console.error(`wrangler を起動できませんでした: ${error.message}`)
      resolve(1)
    })
    child.on("close", (code) => resolve(code ?? 1))
  })
}

/**
 * 型生成専用の wrangler 設定を書き出す。
 *
 * `main` を残すとビルド成果物 (.open-next/worker.js) の有無で `Cloudflare.GlobalProps` が
 * 出たり消えたりして、ビルド前後で生成結果が変わってしまうため落とす。
 * 相対パスの解決先を変えないよう、コピー先はリポジトリルートに置く。
 */
async function writeTypesConfig(): Promise<void> {
  const source = await readFile(SOURCE_CONFIG_PATH, "utf8")
  const withoutMain = applyEdits(source, modify(source, ["main"], undefined, {}))

  await writeFile(TYPES_CONFIG_PATH, withoutMain, "utf8")
}

function buildWranglerArguments(props: { outputPath: string; shouldCheck: boolean }): string[] {
  const args = [
    "types",
    "--config",
    TYPES_CONFIG_PATH,
    "--env-file",
    ENV_FILE_PATH,
    "--env-interface",
    ENV_INTERFACE,
  ]
  if (props.shouldCheck) {
    args.push("--check")
  }
  args.push(props.outputPath)

  return args
}

async function main(): Promise<void> {
  const outputPath = getCliOption("output") ?? OUTPUT_PATH
  const shouldCheck = process.argv.includes("--check")

  await writeTypesConfig()
  try {
    const exitCode = await runWrangler(buildWranglerArguments({ outputPath, shouldCheck }))
    if (exitCode !== 0) {
      throw new Error(`wrangler types が終了コード ${exitCode} で失敗しました`)
    }
  } finally {
    await rm(TYPES_CONFIG_PATH, { force: true })
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
