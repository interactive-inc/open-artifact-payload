import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

import { assertSlug } from '@/core/scripts/slug'

const execFileAsync = promisify(execFile)

export async function createD1Database(slug: string): Promise<string> {
  assertSlug(slug)
  const result = await execFileAsync('bunx', ['wrangler', 'd1', 'create', `${slug}-cms`])
  const databaseId = result.stdout.match(/"database_id":\s*"([^"]+)"/)?.[1]
  if (!databaseId) {
    throw new Error('wrangler d1 create の出力から database_id を抽出できませんでした')
  }
  return databaseId
}
