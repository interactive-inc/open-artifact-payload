import { access, copyFile, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

import { createD1Database } from '@/core/scripts/create-d1-database'
import { createR2Bucket } from '@/core/scripts/create-r2-bucket'
import { askSetupQuestions } from '@/core/scripts/setup-project-prompts'
import { applySsgMode } from '@/core/scripts/setup-ssg-mode'
import {
  withDatabaseId,
  withR2BucketName,
  withWorkerName,
} from '@/core/scripts/update-wrangler'
import { writeEnvFile } from '@/core/scripts/write-env'

const ROOT = process.cwd()
const WRANGLER = path.join(ROOT, 'wrangler.jsonc')
const ENV = path.join(ROOT, '.env')
const BRIEF_TEMPLATE = path.join(ROOT, '.docs/project-brief.template.md')
const BRIEF = path.join(ROOT, '.docs/project-brief.md')

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

  if (answers.deployMode === 'cloudflare') {
    const source = await readFile(WRANGLER, 'utf8')
    const withName = withWorkerName(source, answers.projectSlug)
    const withBucket = withR2BucketName(withName, `${answers.projectSlug}-cms`)

    const finalSource = answers.createD1
      ? withDatabaseId(withBucket, await createD1Database(answers.projectSlug))
      : withBucket

    await writeFile(WRANGLER, finalSource, 'utf8')

    if (answers.createR2) {
      await createR2Bucket(answers.projectSlug)
    }
  }

  await writeEnvFile({
    envPath: ENV,
    payloadSecret: answers.generateSecret ? undefined : '',
    serverUrl: 'http://localhost:3000',
  })

  await copyProjectBrief()

  if (answers.deployMode === 'ssg') {
    await applySsgMode()
    console.log(
      'SSG モードを適用しました。Payload REST API の接続先は docs/superpowers/notes/ssg-mode.md を参照して手動設定してください。',
    )
  }

  console.log('セットアップが完了しました。bun dev で起動できます。')
}

main().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
