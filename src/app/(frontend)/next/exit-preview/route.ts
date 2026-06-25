import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'

// オープンリダイレクト防止: 自サイト内の相対パスのみ許可する。
// `/\evil.com` のようなバックスラッシュ起点や `//evil.com` の protocol-relative URL を弾く必要がある
// (ブラウザはバックスラッシュをスラッシュに正規化するため `/\evil.com` も外部遷移になる)。
function toSafePath(path: string | null): string {
  if (!path) return '/'
  if (!path.startsWith('/')) return '/'
  if (path.length > 1 && (path[1] === '/' || path[1] === '\\')) return '/'
  if (path.includes(':')) return '/'
  return path
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const path = toSafePath(url.searchParams.get('path'))

  const draft = await draftMode()
  draft.disable()

  redirect(path)
}
