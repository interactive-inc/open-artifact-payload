import { createInterface } from "node:readline/promises"

import {
  assertCloudflareAccountId,
  assertCloudflareDatabaseId,
} from "@/core/scripts/cloudflare-config"
import { assertSlug } from "@/core/scripts/slug"

// このテンプレートは Cloudflare Workers 専用。静的書き出し (SSG) などの別デプロイモードは提供しない
type SetupAnswers = {
  projectSlug: string
  cloudflareAccountId: string
  createD1: boolean
  databaseId?: string
  createR2: boolean
  generateSecret: boolean
}

export async function askSetupQuestions(): Promise<SetupAnswers> {
  const readlineInterface = createInterface({ input: process.stdin, output: process.stdout })

  try {
    const projectSlug = await readlineInterface.question("案件 slug (英小文字とハイフン): ")
    assertSlug(projectSlug)

    const cloudflareAccountId = await readlineInterface.question(
      "Cloudflare Account ID (32桁の16進数): ",
    )
    assertCloudflareAccountId(cloudflareAccountId)

    const createD1Raw = await readlineInterface.question("Cloudflare D1 を今作成しますか? (y/N): ")
    const createD1 = createD1Raw.toLowerCase().startsWith("y")

    let databaseId: string | undefined
    if (!createD1) {
      databaseId = await readlineInterface.question("既存の D1 database_id (未作成なら空欄): ")
    }
    if (databaseId) assertCloudflareDatabaseId(databaseId)

    const createR2Raw = await readlineInterface.question("Cloudflare R2 を今作成しますか? (y/N): ")
    const createR2 = createR2Raw.toLowerCase().startsWith("y")

    const generateSecretRaw = await readlineInterface.question(
      "PAYLOAD_SECRET を生成しますか? (Y/n): ",
    )
    const generateSecret = !generateSecretRaw.toLowerCase().startsWith("n")

    return { projectSlug, cloudflareAccountId, createD1, databaseId, createR2, generateSecret }
  } finally {
    readlineInterface.close()
  }
}
