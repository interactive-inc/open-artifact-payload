import { createInterface } from 'node:readline/promises'

import { assertSlug } from '@/core/scripts/slug'

type Answers = {
  projectSlug: string
  deployMode: 'cloudflare' | 'ssg'
  createD1: boolean
  createR2: boolean
  generateSecret: boolean
}

export async function askSetupQuestions(): Promise<Answers> {
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  try {
    const projectSlug = await rl.question('案件 slug (英小文字とハイフン): ')
    assertSlug(projectSlug)
    const deployModeRaw = await rl.question('デプロイモード (cloudflare / ssg) [cloudflare]: ')
    const deployMode = deployModeRaw === 'ssg' ? 'ssg' : 'cloudflare'
    const createD1Raw = await rl.question('Cloudflare D1 を今作成しますか? (y/N): ')
    const createD1 = createD1Raw.toLowerCase().startsWith('y')
    const createR2Raw = await rl.question('Cloudflare R2 を今作成しますか? (y/N): ')
    const createR2 = createR2Raw.toLowerCase().startsWith('y')
    const generateSecretRaw = await rl.question('PAYLOAD_SECRET を生成しますか? (Y/n): ')
    const generateSecret = !generateSecretRaw.toLowerCase().startsWith('n')
    return { projectSlug, deployMode, createD1, createR2, generateSecret }
  } finally {
    rl.close()
  }
}
