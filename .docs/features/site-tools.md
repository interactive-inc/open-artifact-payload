# CLI / MCP によるサイト操作

## Job

開発者やAIクライアントが、管理画面を手操作せずにサイトコンテンツを確認・更新する。操作はPayloadの既存権限、バリデーション、revalidation hookを通る。

CLIとMCPは公開リソースを共有し、認証情報は用途ごとに分離しています。

- CLI: 人が使う場合はPayloadログインのJWTセッション、CIではUsers API Keyを使う
- MCP: AIクライアントからの対話操作。公式Payload MCP専用API Keyを使う

## CLI

### コマンドの準備

リポジトリ内では次のどちらでも実行できます。

```bash
vp run intacms --help
bun packages/cli/lib/index.ts --help
```

Hiractと同じように `intacms` だけで実行したい開発端末では、workspace packageを一度グローバルリンクします。

```bash
cd packages/cli
bun link
intacms --help
```

`open-artifact` は既存利用向けの別名として残しています。

### ログインと環境

設定とログインセッションは `~/.config/intacms/` に環境URL単位で保存します。`XDG_CONFIG_HOME` がある場合はその配下です。設定ディレクトリはmode `0700`、`accounts.json` は `0600` へ毎回補正します。

```bash
# ローカルPayloadへログイン
intacms login --local --email admin@example.com
# Password: と表示されたら端末へ非表示入力する

# 現在のユーザー確認とログアウト
intacms whoami --local
intacms logout --local           # Payload側セッションも失効する
```

同じ環境へ再ログインした場合は、保存済みの古いPayloadセッションを失効してから新しいJWTへ置き換えます。

環境フラグは次のとおりです。指定しない場合は `prod` です。

- `--local`: 既定は `http://localhost:3000`
- `--staging`（`--stg`、`--beta`）
- `--staging-blue`（`--stg-blue`）
- `--prod`

案件ごとのURLは一度設定します。本番URLを未設定のままデフォルト環境を使うと、推測せずエラーにします。

```bash
intacms config set endpoint.prod https://example.com
intacms config set endpoint.staging https://staging.example.com
intacms config set endpoint.stg-blue https://stg-blue.example.com
intacms config get
```

prod-lockは初期状態から有効です。本番アクセスには明示的な `--prod` が必要です。意図して解除するときだけ `intacms config set prod-lock false` を実行します。非ローカルURLはHTTPSだけを受け付け、`http://` はlocalhost系に限定します。

```bash
intacms config set prod-lock true
intacms news                 # エラー
intacms news --prod          # 実行
```

### REST形式のリソース操作

collectionは一覧、詳細、作成、更新、削除を同じ規則で操作します。

```bash
intacms news --local
intacms news --local --limit 20 --page 1 --locale ja
intacms news 42 view --local
intacms news create --local \
  --title "お知らせ" \
  --slug notice \
  --published-at 2026-08-03T00:00:00.000Z \
  --category info \
  --draft
intacms news 42 update --local --title "更新後のタイトル"
intacms news 42 delete --local
intacms news 42 delete --prod --confirm
```

globalは取得と更新です。

```bash
intacms site-settings --local --locale ja
intacms site-settings update --local --site-name "新しいサイト名"
```

書き込みフラグはそのままJSON bodyへ変換します。kebab-caseの `--published-at` は `publishedAt` になります。`true`、`false`、`null`、数値、JSON object / arrayは自動型付けされます。数値に見える文字列はJSON文字列として渡します。

```bash
intacms faq create --local --question "部屋番号は？" --room '"9"' --tags '["入居","設備"]'
```

コマンドと対象リソースはコード上のallowlistから検索できます。個別ヘルプはフィールドフラグの規則と操作形を表示します。最終的なフィールド要件はPayloadのcollection / global定義が正本です。

```bash
intacms commands
intacms commands --q news
intacms news --help
```

現在公開するcollectionは `media`、`news`、`faq`、`works`、globalは `site-settings`、`home-page`、`about`、`service` です。CLIとMCPは `SITE_RESOURCE_CATALOG` を同じresource allowlistとして使い、チャネル別の操作上限も同じ定義に保持します。ユーザー、問い合わせ、翻訳設定・ログは対象外です。

### CIのAPI Key互換

非対話のCIでは、ログインセッションを保存せずUsers API Keyを利用できます。API Keyは保存済みJWTより優先されます。

1. `/admin` へ管理者としてログインする
2. サイドバーの「ユーザー一覧」から操作専用ユーザーを作るか、対象ユーザーを開く
3. API Keyを有効にして表示されたキーを安全な場所へ保存する
4. 必要最小限のロールを設定する。お知らせの作成・更新はeditor、削除や `site-settings` 更新はadminが必要

```bash
export OPEN_ARTIFACT_ENDPOINT='https://example.com'
export OPEN_ARTIFACT_API_KEY='replace-with-user-api-key'
intacms news --limit 20
```

認証collectionを変更した案件だけ `OPEN_ARTIFACT_AUTH_COLLECTION` を設定します。既定値は `users` です。

従来の `open-artifact collections list --slug news` 形式も互換コマンドとして利用できますが、共有allowlist外のslugは拒否します。`--password` はシェル履歴やプロセス一覧への漏えいを防ぐため利用できません。非対話処理ではUsers API Keyを使います。

## MCP

### MCP API Keyの準備

1. `/admin` へadminロールの管理者としてログインする（editorはMCPキーを閲覧・作成・変更・削除できない）
2. サイドバーの「MCP」→「API Keys」を開く
3. キーを紐づけるPayloadユーザーと用途ラベルを選ぶ
4. API Keyを有効化し、必要なcollection / globalの操作だけをチェックする
5. 表示されたキーをMCPクライアントのsecret設定へ保存する

キーの有効期限は作成時から90日後が既定です。期限切れ、無効な日時、期限未設定の既存キーはMCP接続を拒否するため、期限前に新しいキーへローテーションします。

コード上の公開上限は共有 `SITE_RESOURCE_CATALOG` から `src/project/mcp.ts` が生成します。CLIと同じ8リソースだけを公開できます。

### クライアント設定

Streamable HTTP対応MCPクライアントへ、次の接続情報を登録します。設定ファイルの具体的な形式はクライアントに合わせてください。

```json
{
  "url": "https://example.com/api/mcp",
  "headers": {
    "Authorization": "Bearer replace-with-mcp-api-key"
  }
}
```

ローカル開発ではURLを `http://localhost:3000/api/mcp` にします。MCPキーとCLIのUsers API Keyは互換ではありません。MCPキーをPayload RESTのAPI Keyとして直接利用しても、通常のコンテンツ操作ユーザーとは認証されません。

公式プラグインは、許可されたリソースに対して次の名前でToolを生成します。

- collection: `findNews`、`createNews`、`updateNews` のような `操作 + Slug`
- global: `findSiteSettings`、`updateSiteSettings` のような `find / update + Slug`

各MCP API KeyでチェックしていないToolはクライアントへ公開されません。collection削除はMCPのコード上限から外しており、必要な場合は本番確認付きCLIか、監査要件を持つ業務固有Toolとして扱います。その他の操作も、紐づくPayloadユーザーのaccessが拒否すれば実行できません。

### 業務固有Toolの追加

単一collectionのCRUDは追加しません。複数リソースの整合性、監査、外部連携などの業務ルールがある場合だけ、`projectMcpConfig.mcp.tools` へカスタムToolを追加します。handlerは入力を検証してApplication use caseへ渡し、Payloadの `req` とユーザー文脈を維持します。

## 検証

```bash
vp check
vp test run packages tests/int/mcp-plugin.int.spec.ts tests/int/site-management-api-key.int.spec.ts tests/int/core/users-read-access.int.spec.ts
```

構成と依存方向は [[architecture]]、守る規則は [[domain]]、採用理由は [[decisions/002-official-payload-mcp]] と [[decisions/003-intacms-cli]] を参照してください。
