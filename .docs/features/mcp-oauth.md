# ChatGPT・Claude・CodexからのOAuth接続

## 接続先と利用手順

接続先は各案件の正規URLに `/mcp` を付けたものです（例: `https://staging.example.com/mcp`）。通常のMCP APIキー用 `/api/mcp/` とは異なります。

1. ChatGPTのカスタムアプリ/MCP設定、またはClaudeの「設定 → コネクタ → カスタムコネクタ」に接続先URLを登録します。ChatGPTは開発者モードとカスタムMCPが利用できるアカウント・ワークスペースで操作します。組織で制限されている場合は管理者による有効化が必要です。
2. 認証方式はOAuthです。APIキー、Bearer環境変数、Basic認証ヘッダー、独自ヘッダーは登録しません。OAuth Client ID/Secretは、動的登録を使う場合は空欄です。
3. ブラウザでCMSの認可画面が開きます。開発環境ではブラウザ上でBasic認証を通過し、CMSアカウントでログインします。
4. アプリ名・接続先・戻り先を確認します。既定は閲覧のみです。チャットで更新する場合は「登録・更新・公開状態の変更も許可する」にチェックして「接続を許可」を押します。
5. チャットで登録したアプリ/コネクタを有効にし、例えば「ニュースを1件作成し、タイトルを『接続確認』として下書き保存して」と依頼します。公開する場合は別途その意図を明示してください。

Codexでも同じOAuth URLを使えます。従来のBasic/APIキーヘッダーはこの接続から削除し、OAuthログインを実行します。以前のAPIキー接続を残す場合は別名で登録します。

管理画面の「AI接続の管理」(`/oauth/connections/`) で、自分が許可したアプリと権限を確認し、接続を解除できます。CMSからログアウトするだけではOAuth接続は解除されません。Cloudflare KVの反映特性により、解除から拒否まで最大1分程度かかる場合があります。

公式案内: [ChatGPT OAuth](https://developers.openai.com/plugins/build/auth)、[Claudeカスタムコネクタ](https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp)。アプリごとの確認画面・利用条件は各サービスの案内に従います。WebMCPは別のブラウザ連携で、このOAuth設定では使用しません。

## 認証と権限

- `@cloudflare/workers-oauth-provider` にOAuthの認可コード、PKCE S256、CIMD/DCR、期限、audience検証、refresh、revokeを委ねます。認可コードの再使用は拒否され、関連トークンも失効します。
- `/mcp`、OAuthメタデータ、トークン交換、クライアント登録のみBasic認証を免除します。CMS、従来REST/MCP、同意・接続管理画面はBasic認証を維持します。公開トークン/登録入口にはIP単位の頻度制限があります。
- 同意にはCMSの通常ログインセッションが必要です。フォームは同一origin・ユーザー・認可URLに結び付けた10分有効のCSRFトークンを検証します。外部client名などはHTMLエスケープし、iframe埋め込みを禁止します。
- access tokenは15分、refresh tokenは30日です。開発・本番で別KVを使い、環境の正規URLをissuer/resourceに固定します。OAuthユーザー情報は検証後のWorker contextで渡し、HTTPヘッダーに変換しません。
- 実効権限は「リソースカタログのMCP公開操作」「利用者が許可したscope」「現在のCMSユーザーのPayload access」の積集合です。各リクエストでユーザーを再取得し、削除・ロール変更・アカウントロックを反映します。
- `mcp:read` は閲覧、`mcp:write` は登録・更新です。更新には両方必要です。scopeを絞ったrefreshも反映します。削除、ユーザー、MCPキー、問い合わせ、翻訳設定・ログは公開しません。
- OAuthトークンは通常のREST API認証には使えません。APIキー用MCPとCLIの認証は [site-tools](site-tools.md) を参照してください。

## 別環境への導入

`NEXT_PUBLIC_SERVER_URL` はビルド時とWorker実行時を同じ正規HTTPS originにします。ローカルの `vp dev` はWorkerのOAuth入口を通らないため、OAuthの検証は `vp run build:preview` → `vp run preview` で行います。

1. 環境専用KVを作成します。例: `vp exec wrangler kv namespace create <project>-staging-oauth --env staging --update-config false`。
2. `wrangler.jsonc` の対象環境に次の設定を追加します。既存のvars/ratelimits/その他bindingsは保持し、下記の差分をマージします。

```jsonc
{
  "vars": {
    "MCP_OAUTH_ENABLED": "true",
    "NEXT_PUBLIC_SERVER_URL": "https://staging.example.com",
  },
  "kv_namespaces": [{ "binding": "OAUTH_KV", "id": "<作成した32桁ID>", "remote": true }],
  "ratelimits": [
    {
      "name": "OAUTH_RATE_LIMITER",
      "namespace_id": "<アカウント内で固有の整数>",
      "simple": { "limit": 60, "period": 60 },
    },
  ],
}
```

3. Basic認証を有効にする環境では `BASIC_AUTH_ENABLED=true`、username/passwordをWorker secretへ登録し、`assets.run_worker_first=true` を設定します。秘密値をGitやチャットへ貼り付けません。
4. `vp run generate:types` と環境指定のpreflightを実行してからデプロイします。OAuth有効時にKV・正規HTTPS origin・頻度制限が不足している設定や、環境間でKVを共有した設定はpreflightで拒否します。
5. 公開メタデータが200、無認証の `/mcp` がBearer challenge付き401、CMSが引き続き保護されることを確認し、実際のアプリから接続します。

本番へ移す場合は本番専用KVと本番URLを設定し、クライアントに本番用の接続を別途登録します。開発のOAuthトークンは本番へ流用できません。CLIは既存の `--staging` / `--prod` と環境別URL設定を使います。

Cloudflareで403/1010やブラウザ検証が出る場合はWorker到達前の拒否です。Security Eventsを確認し、該当ホストの上記機械用パスだけを対象に必要な除外を設定します。CMS全体のBasic認証を外す必要はありません。

## 検証

`vp check`、`vp test run`、Worker build後の `vp run test:e2e:development-access` で、Basic境界・CMSログインと同意・PKCE・MCP下書き作成/更新・scope縮小・接続解除を検証します。アプリ側のプランや組織設定による制限は、このプロトコル検証とは別に利用アカウントで確認します。
