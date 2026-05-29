import { readFile, writeFile } from 'node:fs/promises'

import { generatePayloadSecret } from '@/core/scripts/generate-payload-secret'

type Props = {
  envPath: string
  payloadSecret?: string
  serverUrl?: string
}

export async function writeEnvFile(props: Props): Promise<void> {
  const lines: string[] = []
  try {
    const existing = await readFile(props.envPath, 'utf8')
    for (const line of existing.split('\n')) {
      if (line.startsWith('PAYLOAD_SECRET=')) continue
      if (line.startsWith('NEXT_PUBLIC_SERVER_URL=')) continue
      if (line.trim().length > 0) lines.push(line)
    }
  } catch {
    // 未作成は無視
  }

  lines.push(`PAYLOAD_SECRET=${props.payloadSecret ?? generatePayloadSecret()}`)
  if (props.serverUrl) {
    lines.push(`NEXT_PUBLIC_SERVER_URL=${props.serverUrl}`)
  }

  await writeFile(props.envPath, `${lines.join('\n')}\n`, 'utf8')
}
