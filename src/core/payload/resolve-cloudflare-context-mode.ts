export type CloudflareContextMode = "opennext" | "wrangler-local" | "wrangler-remote"

type Props = {
  isCLI: boolean
  hasOpenNextContext: boolean
  isRemoteBindingsRequested: boolean
}

/**
 * Cloudflare コンテキストの取得経路を決定する。
 * リモート D1 / R2 を使うのは、Payload CLI から呼ばれ (isCLI) かつ
 * CLOUDFLARE_REMOTE_BINDINGS=true が明示された (isRemoteBindingsRequested) ときだけ。
 * CLI 単体の他の呼び出しはローカル binding (wrangler-local) を使い、
 * Next/Worker 上で OpenNext がコンテキストを注入済みならそれ (opennext) を使う。
 * next build や vitest など CLI でない経路は、フラグが立っていても remote にしない。
 * これによりビルドが常に Cloudflare アカウントへ依存しない状態を保つ。
 */
export function resolveCloudflareContextMode(props: Props): CloudflareContextMode {
  if (props.isCLI && props.isRemoteBindingsRequested) return "wrangler-remote"

  if (props.isCLI) return "wrangler-local"

  if (props.hasOpenNextContext) return "opennext"

  return "wrangler-local"
}
