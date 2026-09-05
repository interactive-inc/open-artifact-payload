import { draftMode } from "next/headers"
import { redirect } from "next/navigation"
import { getPayload } from "payload"

import { authenticatePreviewUser } from "@/core/lib/preview/authenticate-preview-user"
import config from "@/payload.config"

import { toSafePreviewPath } from "@/core/lib/preview/to-safe-preview-path"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const path = toSafePreviewPath(url.searchParams.get("path"))

  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const user = await authenticatePreviewUser(payload, request.headers)

  if (!user) {
    return new Response("Unauthorized", { status: 401 })
  }

  const draft = await draftMode()
  draft.enable()

  redirect(path)
}
