# Unit test strategy

## Runner

このリポジトリはVite+を正本とし、`vp test run`でunitとintegrationの両projectを実行する。

DB不要の値・受付手順・表示テストは実装隣の `src/**/*.test.ts(x)`、依存方向など横断検査は `tests/unit/**/*.test.ts(x)` に置き、`vp run test:unit` で実行する。setup/globalSetupは空でPayload/D1/Cloudflareを起動しない。純粋な層へSDKのmockを持ち込まず、受付手順へ必要な操作を注入する。

`vp run test:int` は `tests/int/**/*.int.spec.ts(x)` と既存 `packages/**/*.test.ts` を収集し、使い捨てDB用setupを使う。packageのtest/test:ciとCIも両projectを一度ずつ実行する。

## 探索対象

- ライブラリ関数: `packages/site-management/lib`、`packages/cli/lib`、`src/core/lib`
- Reactコンポーネント: `src/core`、`src/app/(frontend)`、`src/cms/admin` 配下の `*.tsx`
- Payload統合境界: `tests/int`

DOMを使う隣接テストは冒頭に `/** @vitest-environment jsdom */` を付ける。unitの既定環境はnodeのままとし、DOMを使うためにDB setupを読み込まない。

## 除外パターン

- `index.ts`、`*.d.ts`、生成物
- React HookやNext.js runtimeへ直接依存し、入出力を分離できないコンポーネント
- 外部APIを直接呼ぶ処理は単体テスト対象外とし、Portを注入できる境界か統合テストで検証する

## 統合テスト方針

Payloadの認証、access、validation、hookを確認する操作は `tests/int` で `handleEndpoints` を使い、実HTTPと同じRequest / Response境界を通す。CLIはargvからの実行経路、MCPは `/api/mcp` のJSON-RPC経路を検証する。
