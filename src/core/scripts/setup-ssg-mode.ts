import { mkdir, readFile, rm, writeFile } from "node:fs/promises"
import path from "node:path"

const ROOT = process.cwd()

async function ensureOutputExport(): Promise<void> {
  const nextConfigPath = path.join(ROOT, "next.config.ts")
  const nextConfig = await readFile(nextConfigPath, "utf8")
  if (nextConfig.includes("output: 'export'")) return
  const replaced = nextConfig.replace(
    "const nextConfig = {",
    "const nextConfig = {\n  output: 'export',",
  )
  await writeFile(nextConfigPath, replaced, "utf8")
}

async function ensureUnoptimizedImages(): Promise<void> {
  const nextConfigPath = path.join(ROOT, "next.config.ts")
  const nextConfig = await readFile(nextConfigPath, "utf8")
  if (nextConfig.includes("unoptimized: true")) return
  const replaced = nextConfig.replace("images: {", "images: {\n    unoptimized: true,")
  await writeFile(nextConfigPath, replaced, "utf8")
}

async function writeDeployWorkflow(): Promise<void> {
  const workflowDir = path.join(ROOT, ".github/workflows")
  await mkdir(workflowDir, { recursive: true })
  const workflowPath = path.join(workflowDir, "deploy-static.yml")
  const workflow = `name: deploy-static

on:
  repository_dispatch:
    types: [payload-published]
  workflow_dispatch:

jobs:
  build-and-rsync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
        with:
          bun-version: "1.3"
      - run: vp install
      - run: vp run build
      - name: rsync to xserver (第一案件で詳細を詰める)
        env:
          RSYNC_HOST: \${{ secrets.RSYNC_HOST }}
          RSYNC_USER: \${{ secrets.RSYNC_USER }}
          RSYNC_KEY: \${{ secrets.RSYNC_KEY }}
        run: echo 'rsync 実行コマンドは第一案件で詳細を詰める'
`
  await writeFile(workflowPath, workflow, "utf8")
}

export async function applySsgMode(): Promise<void> {
  await rm(path.join(ROOT, "src/app/(payload)"), { recursive: true, force: true })
  await rm(path.join(ROOT, "src/app/(frontend)/contact"), { recursive: true, force: true })
  // 問い合わせフォーム関連は SSG モードでは使わないため、ディレクトリごと削除する。
  // (個別に rm すると新規追加された submit-contact-form.ts / types.ts などが取り残されてビルドが壊れる)
  await rm(path.join(ROOT, "src/core/frontend/forms"), { recursive: true, force: true })
  await rm(path.join(ROOT, "wrangler.jsonc"), { force: true })
  await ensureOutputExport()
  await ensureUnoptimizedImages()
  await writeDeployWorkflow()
}
