import { cache } from "react"
import { draftMode, headers } from "next/headers"
import { getPayload } from "payload"

import config from "@/payload.config"
import { authenticatePreviewUser } from "@/core/lib/preview/authenticate-preview-user"
import type { User } from "@/payload-types"

export type FrontendAccess = {
  draft: boolean
  user: User | null
  overrideAccess: false
}

/** Cookieは表示モードのみ。下書きの権限はリクエストごとに認証し直す。 */
export const getFrontendAccess = cache(async (): Promise<FrontendAccess> => {
  const mode = await draftMode()
  if (!mode.isEnabled) return { draft: false, user: null, overrideAccess: false }

  const payload = await getPayload({ config: await config })
  const user = await authenticatePreviewUser(payload, await headers())
  return { draft: user !== null, user, overrideAccess: false }
})
