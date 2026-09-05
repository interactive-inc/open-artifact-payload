import { draftMode } from "next/headers"
import { redirect } from "next/navigation"

import { toSafePreviewPath } from "@/core/lib/preview/to-safe-preview-path"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const path = toSafePreviewPath(url.searchParams.get("path"))

  const draft = await draftMode()
  draft.disable()

  redirect(path)
}
