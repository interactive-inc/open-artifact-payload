# アーキテクチャ

## システム境界

ルート workspace は Next.js / Payload によるサイト本体です。CLIは `SiteManagementRuntime` を composition root としてPayload REST APIを使います。MCPの基本CRUDは、サイト本体へ組み込んだPayload公式プラグインが直接提供します。

```text
CLI -> SiteManagementRuntime -> Application -> PayloadRestClient -> REST API ─┐
                                                                             ├─> Payload access / validation / hooks -> D1 / R2
MCP client -> @payloadcms/plugin-mcp -> generated CRUD / custom use case ─────┘
```

## Workspace

- ルート: サイト本体。Payload のコレクション、グローバル、アクセス制御、フックを正本とする
- `packages/site-management`: Domain / Application / Infrastructure / Runtime。CLIとMCPの共有リソースカタログも持つ
- `packages/cli`: argv、環境、ログインセッションをHonoの内部リクエストへ変換するInterface
- `src/project/mcp.ts`: 共有カタログから公式MCP設定を生成し、公開操作の上限にする

## 依存方向

CLIはInterfaceからApplication、Domain、Infrastructureへの一方向です。リソース操作はCLIがHonoの内部リクエストへ変換し、`SiteManagementRuntime`だけを呼びます。PayloadのREST URLと認証ヘッダーはRuntime配下のInfrastructureが組み立てます。ログイン、設定ファイル、環境選択はCLIホスト固有の境界なので `packages/cli` 内に閉じています。

Infrastructure の `PayloadRestClient` は外部 HTTP 境界を一か所に集約します。テストでは `FetchPort` に偽物を渡し、実ネットワークや Payload のモックサーバーを使わずにリクエスト契約を検証します。

MCPの汎用CRUDには独自Application層を重ねません。公式プラグインがPayload Local APIを `overrideAccess: false` で呼ぶため、Payloadを単一の集約境界として扱えます。今後追加する業務固有ToolだけがDDDのApplication use caseを呼び、MCP handlerは入力・出力の変換に限定します。

## エラー

CLIのApplicationとInfrastructureはthrowを公開境界へ流さず、`T | Error`を返します。Payloadの非2xx応答は `PayloadApiError` に変換し、CLIが終了コードへ写像します。公式MCPのプロトコルエラーはプラグインに委ねます。

## 認証と認可

CLIの対話利用はPayload標準ログインで得たJWTを環境URL単位に保存し、`Authorization: JWT <token>` を使います。CIではUsers API Keyを環境変数から受け取り、`Authorization: users API-Key <key>` を使います。認証ヘッダーの選択と生成はInfrastructure境界に閉じています。

環境URLとprod-lockは `preferences.json`、JWTは `accounts.json` に分離します。秘密を含む `accounts.json` はmode `0600`、設定ディレクトリは `0700` へ補正し、ファイルは原子的に更新します。パスワードは非表示TTY入力だけを許可し、argvには受け取りません。ログアウトはPayloadのsessionを失効してからローカルJWTを削除します。

prod-lockは既定で有効です。本番URLは設定必須とし、`--prod` の明示を要求します。本番削除はさらに `--confirm` を必要とします。非ローカルendpointはHTTPSのみ許可し、REST/Authクライアントの通信には30秒timeoutを設定します。

MCPは公式プラグインが追加する `payload-mcp-api-keys` を使い、`Authorization: Bearer <key>` で認証します。権限は次の積集合です。

1. `src/project/mcp.ts` が公開を許可した操作
2. MCP API Keyで管理者が有効にした操作
3. 紐づくPayloadユーザーのcollection / global access

`payload-mcp-api-keys` 自体はadminだけが管理でき、キーは既定90日で失効します。collection削除、ユーザー、問い合わせ、翻訳設定・ログは1の段階でMCP対象外にしています。Users collectionはadmin/serviceAdmin以外に自分の行だけを返し、他ユーザーのUsers API Keyを露出しません。

MCPキーはPayload上の独立したauth collectionでもありますが、その認証主体自身を通常のコンテンツユーザーとは扱いません。共通accessはUsers由来の有効ロールを検証するため、MCPキーをPayload RESTの認証ヘッダーへ直接流用しても、Toolごとの権限を迂回できません。

詳細な採用理由は [[decisions/001-site-management-boundary]]、[[decisions/002-official-payload-mcp]]、[[decisions/003-intacms-cli]] を参照してください。
