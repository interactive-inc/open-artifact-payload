import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

import config from '@/payload.config'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const path = url.searchParams.get('path') ?? '/'

  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const auth = await payload.auth({ headers: request.headers })

  if (!auth.user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const draft = await draftMode()
  draft.enable()

  redirect(path)
}
