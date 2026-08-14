import { createInterface } from "node:readline/promises"

import {
  assertCloudflareAccountId,
  assertCloudflareDatabaseId,
} from "@/core/scripts/cloudflare-config"
import { assertSlug } from "@/core/scripts/slug"

type CloudflareAnswers = {
  projectSlug: string
  deployMode: "cloudflare"
  cloudflareAccountId: string
  createD1: boolean
  databaseId?: string
  createR2: boolean
  generateSecret: boolean
}

type SsgAnswers = {
  projectSlug: string
  deployMode: "ssg"
  generateSecret: boolean
}

type Answers = CloudflareAnswers | SsgAnswers

export async function askSetupQuestions(): Promise<Answers> {
  const readlineInterface = createInterface({ input: process.stdin, output: process.stdout })
  try {
    const projectSlug = await readlineInterface.question("案件 slug (英小文字とハイフン): ")
    assertSlug(projectSlug)
    const deployModeRaw = await readlineInterface.question(
      "デプロイモード (cloudflare / ssg) [cloudflare]: ",
    )
    const deployMode = deployModeRaw === "ssg" ? "ssg" : "cloudflare"
    let cloudflareAnswers:
      | Pick<CloudflareAnswers, "cloudflareAccountId" | "createD1" | "createR2" | "databaseId">
      | undefined
    if (deployMode === "cloudflare") {
      const cloudflareAccountId = await readlineInterface.question(
        "Cloudflare Account ID (32桁の16進数): ",
      )
      assertCloudflareAccountId(cloudflareAccountId)
      const createD1Raw = await readlineInterface.question(
        "Cloudflare D1 を今作成しますか? (y/N): ",
      )
      const createD1 = createD1Raw.toLowerCase().startsWith("y")
      const databaseId = createD1
        ? undefined
        : await readlineInterface.question("既存の D1 database_id (未作成なら空欄): ")
      if (databaseId) assertCloudflareDatabaseId(databaseId)
      const createR2Raw = await readlineInterface.question(
        "Cloudflare R2 を今作成しますか? (y/N): ",
      )
      cloudflareAnswers = {
        cloudflareAccountId,
        createD1,
        databaseId,
        createR2: createR2Raw.toLowerCase().startsWith("y"),
      }
    }
    const generateSecretRaw = await readlineInterface.question(
      "PAYLOAD_SECRET を生成しますか? (Y/n): ",
    )
    const generateSecret = !generateSecretRaw.toLowerCase().startsWith("n")
    if (deployMode === "ssg") return { projectSlug, deployMode, generateSecret }
    if (!cloudflareAnswers) throw new Error("Cloudflare の回答を取得できませんでした")
    return { projectSlug, deployMode, generateSecret, ...cloudflareAnswers }
  } finally {
    readlineInterface.close()
  }
}
