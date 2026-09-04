const defaultTestPersistPath = ".wrangler/state-test"

/**
 * 統合テストが使うローカル D1 / R2 の保存先。開発用の `.wrangler/state` とは分け、
 * 実行のたびに作り直す前提の使い捨て領域にする。E2E の `.wrangler/state-e2e` と同じ仕組み。
 * 明示的に `CLOUDFLARE_PERSIST_PATH` が渡された場合はそれを優先する。
 */
export function resolveTestPersistPath(): string {
  const configured = process.env.CLOUDFLARE_PERSIST_PATH?.trim()

  if (configured) return configured

  return defaultTestPersistPath
}
