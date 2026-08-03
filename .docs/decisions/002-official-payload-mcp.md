# 基本CRUDにPayload公式MCPプラグインを採用する

## Status

Accepted

## Context

独自stdio MCPはCLIとRuntimeを共有できる一方、Payloadが公式提供しているCRUD schema、Streamable HTTP transport、MCP専用API Key管理を重複実装します。汎用CRUDをDDDの業務ユースケースとして抽象化すると、Payloadのcollection / global定義と二つの変更理由を持つ層も増えます。

## Decision

- 基本CRUDは `@payloadcms/plugin-mcp` を使い、`/api/mcp` で公開する
- 公開可能なcollection / globalと操作は `src/project/mcp.ts` に明示する
- 実運用の権限はMCP専用API Keyごとに最小化し、紐づくPayloadユーザーのaccessも必ず適用する
- MCP専用API Keyの管理はadminだけに許可し、作成時から90日の有効期限を既定にする。期限未設定・期限切れキーは拒否する
- MCP専用API Key自身は通常のコンテンツ操作ユーザーとして認証済み扱いにせず、Payload REST経由でTool権限を迂回できないようにする
- collection削除Toolは公開上限から外し、削除は確認付きCLIまたは監査可能な業務固有Toolで扱う
- ユーザー、問い合わせ、翻訳設定・ログなどの機密リソースはMCPへ公開しない
- 実験的な認証・config・collection schema変更Toolは有効にしない
- カスタムToolは業務固有のDDD Application use caseがある場合だけ追加する
- CLIは既存の `SiteManagementRuntime` を維持する。CIはUsers API Keyを使い、対話利用の認証とコマンド体系は [[003-intacms-cli]] で拡張する

## Consequences

- MCPクライアントはデプロイ済みサイトへHTTPで接続でき、ローカルstdioプロセスを起動しなくてよい
- MCPのCRUD schemaはPayloadのフィールド定義へ追従する
- コード上の上限、MCP API Key、Payload accessの三層で権限を絞れる
- MCP API Key collectionのD1マイグレーションが必要になる
- 既存の期限未設定MCPキーは再発行が必要になる
- 独自Toolは公式プラグインの `mcp.tools` 拡張点へ追加し、handlerからApplication use caseを呼ぶ

関連: [[architecture]]、[[domain]]、[[features/site-tools]]
