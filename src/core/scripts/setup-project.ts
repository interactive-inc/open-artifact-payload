import { access, copyFile, readFile, writeFile } from "node:fs/promises"
import path from "node:path"

import { createD1Database } from "@/core/scripts/create-d1-database"
import { createR2Bucket } from "@/core/scripts/create-r2-bucket"
import { askSetupQuestions } from "@/core/scripts/setup-project-prompts"
import { applySsgMode } from "@/core/scripts/setup-ssg-mode"
import { withDatabaseId } from "@/core/scripts/with-database-id"
import { withR2BucketName } from "@/core/scripts/with-r2-bucket-name"
import { withWorkerName } from "@/core/scripts/with-worker-name"
import { writeEnvFile } from "@/core/scripts/write-env"

const ROOT = process.cwd()
const WRANGLER = path.join(ROOT, "wrangler.jsonc")
const ENV = path.join(ROOT, ".env")
const BRIEF_TEMPLATE = path.join(ROOT, ".docs/project-brief.template.md")
const BRIEF = path.join(ROOT, ".docs/project-brief.md")

async function copyProjectBrief(): Promise<void> {
  try {
    await access(BRIEF)
    // 既に project-brief.md があれば上書きせずに早期リターンする
    return
  } catch {
    // BRIEF が未作成のケースなので catch を素通りしてコピーへ
  }
  await copyFile(BRIEF_TEMPLATE, BRIEF)
}

async function main(): Promise<void> {
  const answers = await askSetupQuestions()

  if (answers.deployMode === "cloudflare") {
    const source = await readFile(WRANGLER, "utf8")
    const withName = withWorkerName({ source, name: answers.projectSlug })
    const withBucket = withR2BucketName({
      source: withName,
      bucketName: `${answers.projectSlug}-cms`,
    })

    const finalSource = answers.createD1
      ? withDatabaseId({
          source: withBucket,
          databaseId: await createD1Database(answers.projectSlug),
        })
      : withBucket

    await writeFile(WRANGLER, finalSource, "utf8")

    if (answers.createR2) {
      await createR2Bucket(answers.projectSlug)
    }
  }

  await writeEnvFile({
    envPath: ENV,
    payloadSecret: answers.generateSecret ? undefined : "",
    serverUrl: "http://localhost:3000",
  })

  await copyProjectBrief()

  if (answers.deployMode === "ssg") {
    await applySsgMode()
    console.log(
      "SSG モードを適用しました。Payload REST API の接続先など SSG の残作業は .docs/guide.md の「SSG モード」節を参照して手動設定してください。",
    )
  }

  console.log("セットアップが完了しました。bun dev で起動できます。")
}

main().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
