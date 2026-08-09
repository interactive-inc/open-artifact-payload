import { draftMode } from "next/headers"
import { redirect } from "next/navigation"
import { getPayload } from "payload"

import config from "@/payload.config"

// オープンリダイレクト防止: 自サイト内の相対パスのみ許可する。
// `/\evil.com` のようなバックスラッシュ起点や `//evil.com` の protocol-relative URL を弾く必要がある
// (ブラウザはバックスラッシュをスラッシュに正規化するため `/\evil.com` も外部遷移になる)。
function toSafePath(path: string | null): string {
  if (!path) return "/"
  // 必ず "/" で始まり、2 文字目に "/" や "\" が来ないこと、かつスキーム的な ":" を含まないこと。
  if (!path.startsWith("/")) return "/"
  if (path.length > 1 && (path[1] === "/" || path[1] === "\\")) return "/"
  if (path.includes(":")) return "/"
  return path
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const path = toSafePath(url.searchParams.get("path"))

  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const auth = await payload.auth({ headers: request.headers })

  if (!auth.user) {
    return new Response("Unauthorized", { status: 401 })
  }

  const draft = await draftMode()
  draft.enable()

  redirect(path)
}
