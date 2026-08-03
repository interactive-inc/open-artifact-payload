# サイト管理境界を共有 Runtime と Payload REST API で構成する

## Status

Amended by [[002-official-payload-mcp]]

## Context

サイト本体に CLI と MCP を直接追加すると、引数処理、MCP schema、認証、HTTP 通信が混ざり、同じ操作が複数実装になります。また、既存サイト全体を `apps/site` へ移動すると import、Cloudflare、Payload の生成物に大きな移行差分が生じます。

## Decision

- ルートのサイト配置は維持し、Bun workspaces で `packages/*` を追加する
- Domain / Application / Infrastructure と composition root を `packages/site-management` に集約する
- CLIは共有Runtimeを利用し、Interface固有の変換だけを持つ
- サイト操作は Payload REST API を通し、標準 API Key と既存 access / validation / hooks を利用する
- MCPの初期案は共有Runtimeを使うstdio transportとしたが、[[002-official-payload-mcp]]で公式プラグインへ置き換えた

## Consequences

- CLIの挙動、認証、エラー変換を一か所で保守できる
- サイト本体の配置変更を伴わず、既存ビルドとデプロイを維持できる
- MCPの基本CRUDは公式プラグインが担い、独自Runtimeとの二重実装を避ける
- collection固有の高水準Toolは、汎用CRUDとは別の業務ユースケースとして段階的に追加する

関連: [[architecture]]、[[domain]]、[[features/site-tools]]
