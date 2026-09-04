import { execFileSync } from "node:child_process"
import { rmSync } from "node:fs"
import path from "node:path"

import { resolveTestPersistPath } from "./tests/helpers/resolve-test-persist-path"

// 統合テスト専用のローカル D1 / R2 を毎回まっさらに作り直してから migrate を当てる。
// 開発用の .wrangler/state には触れないため、テストが途中で落ちても開発中のデータは汚れず、
// マイグレーションは常に空のスキーマから検証される。
export default function setup() {
  const persistPath = resolveTestPersistPath()

  rmSync(path.resolve(persistPath), { recursive: true, force: true })
  execFileSync("vp", ["run", "test:int:migrate"], {
    stdio: "inherit",
    env: { ...process.env, CLOUDFLARE_PERSIST_PATH: persistPath },
  })
}
