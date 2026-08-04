# ドメインモデル

## Site Management bounded context

[[features/site-tools|外部サイト操作]]は、Payload の内部実装全体ではなく「サイトコンテンツを指定し、読み書きする」境界として扱います。汎用CRUDと業務固有の操作は分けて設計します。

### Value Object

- `SiteResourceSlug`: collection / global の kebab-case slug。パス逸脱を許可しない
- `SiteDocumentId`: 空でない document ID
- `SiteDocumentTarget`: resource slug と document ID の組
- `JsonObject`: Payload へ送れる JSON object。関数、循環参照、`undefined` を許可しない
- `SiteResourceDefinition`: CLIとMCPへ公開するresource kind、slug、チャネル別の許可操作。resource allowlistを一つに保つ

### CLI use case

- collection の一覧、単一取得、作成、更新、削除
- global の取得、更新
- 環境URLの解決、prod-lock、環境URL単位のログインセッション

1クラスを1ユースケースとし、`execute()` で入力検証、Value Object 生成、Infrastructure 呼び出しを調整します。

### MCP use case

collection / globalの汎用CRUDはPayload公式MCPプラグインの責務です。これらを「お知らせを公開予約する」「複数ページのブランド表記を一括変更する」のような業務ユースケースとはみなしません。

カスタムToolは、複数集約の調整、業務上の不変条件、監査、外部サービス連携が必要な場合だけ追加します。Tool handlerはPayloadの `req` をApplicationへ渡すInterfaceとし、業務判断をhandler内へ書きません。

### Invariant

- resource slug は小文字 kebab-case でなければならない
- document 操作には空でない ID が必要
- 書き込みデータは JSON object でなければならない
- 一覧のページサイズ、relation depth は上限内でなければならない
- CLIとMCPが公開するresource / operationは共有カタログに存在しなければならない
- prod-lock有効時の本番アクセスには明示的な `--prod` が必要
- 本番のcollection削除には `--confirm` が必要で、MCPには削除Toolを公開しない
- 非ローカルendpointはHTTPSでなければならない
- MCPキーはadminだけが管理し、有効期限内でなければ認証に使えない
- MCPキー自身はPayload RESTのコンテンツ操作ユーザーとして扱わず、Users由来の有効ロールを持つ主体だけを認証済みと判定する
- 認可、フィールド要件、公開状態、revalidation は Payload 集約境界で必ず検証する

最後の不変条件は外部ツール側へ複製しません。Payload を正本にすることで、管理画面と外部操作の規則がずれることを防ぎます。
