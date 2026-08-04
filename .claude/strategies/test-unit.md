# Unit test strategy

## Runner

このリポジトリはVite+を正本とし、`vp test run`でVitest互換テストを実行する。

## 探索対象

- ライブラリ関数: `packages/site-management/lib`、`packages/cli/lib`、`src/core/lib`
- Reactコンポーネント: `src/core`、`src/project` 配下の `*.tsx`
- Payload統合境界: `tests/int`

## 除外パターン

- `index.ts`、`*.d.ts`、生成物
- React HookやNext.js runtimeへ直接依存し、入出力を分離できないコンポーネント
- 外部APIを直接呼ぶ処理は単体テスト対象外とし、Portを注入できる境界か統合テストで検証する

## 統合テスト方針

Payloadの認証、access、validation、hookを確認する操作は `tests/int` で `handleEndpoints` を使い、実HTTPと同じRequest / Response境界を通す。CLIはargvからの実行経路、MCPは `/api/mcp` のJSON-RPC経路を検証する。
