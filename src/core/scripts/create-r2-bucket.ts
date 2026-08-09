import { execFile } from "node:child_process"
import { promisify } from "node:util"

import { assertSlug } from "@/core/scripts/slug"

const execFileAsync = promisify(execFile)

export async function createR2Bucket(slug: string): Promise<void> {
  assertSlug(slug)
  await execFileAsync("bunx", ["wrangler", "r2", "bucket", "create", `${slug}-cms`])
}
