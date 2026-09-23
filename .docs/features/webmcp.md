# 管理画面のWebMCP

## 目的

CMSにログインした利用者とAIが、同じ編集画面を使ってコンテンツを確認・編集・保存します。サイト専用のMCP接続設定やAPIキーは不要です。通常のMCPはページを開かずに使う連携として引き続き利用できます。

## 利用方法

WebMCPに対応するブラウザ・AIで `/admin/` を開き、通常のCMSアカウントでログインします。例えば「ニュースを新規作成して、タイトルを○○、本文を○○にして下書きを保存して」と依頼します。

ChatGPTでは、対応するデスクトップアプリの内蔵ブラウザでSite toolsを有効にして使います。対応モデル・ワークスペースは [OpenAIのSite toolsドキュメント](https://learn.chatgpt.com/docs/webmcp) を確認してください。

通常のChromeで開発時に確認する場合は `chrome://flags/#enable-webmcp-testing` を有効にします。現行の `document.modelContext.registerTool` を使い、非対応ブラウザではツールを登録せず、通常の管理画面が動きます。旧 `navigator.modelContext` のAPIへの変換やpolyfillは製品コードに含めません。

## 操作

| ツール                        | 動作                                                                     |
| ----------------------------- | ------------------------------------------------------------------------ |
| `cms_list_resources`          | ログイン中の利用者が参照できる対象コンテンツを一覧表示                   |
| `cms_read_content`            | 保存済みコンテンツの検索・取得。権限のある下書きも対象                   |
| `cms_open_document`           | 既存の編集画面、または新規作成画面を開く                                 |
| `cms_get_current_document`    | 現在のフォーム値、編集可能な項目のschema、下書き・自動保存の設定を取得   |
| `cms_update_current_document` | 現在のフォームを更新。オブジェクトは差分をマージし、配列は全体を置換     |
| `cms_save_current_document`   | `draft` で下書き保存、`publish` で公開、下書きのない対象は `save` で保存 |

編集対象はニュース、制作実績、既存メディアの項目、FAQ、トップページ、会社概要、サービス、サイト設定です。案件の対象は `src/cms/admin/webmcp/webmcp-resources.ts` で定義します。画像ファイルそのもののアップロードは通常の管理画面で行います。

ユーザー、MCPキー、問い合わせ、通知設定、翻訳ログなどは公開対象にしません。公開サイトのフォームには今回のツールを登録しません。コンテンツの削除ツールはありません。

## 編集と保存の扱い

編集ツールはPayloadのフォームを更新します。REST APIへ別経路で書き込んで画面の内容を古いまま残す方式は採用しません。未変更の項目は、人間がまだ保存していない値も維持します。リッチテキストはPayloadのLexical JSONで扱います。

ニュース・制作実績などの自動保存が有効な画面では、ツールでの編集も通常の下書き自動保存に従います。「編集したがDBには絶対に保存しない」という操作ではありません。公開には明示的な `publish` が必要です。下書きのない設定の `save` は公開サイトに即座に反映される場合があります。

編集schemaはPayloadのフィールド定義と文書単位の権限から作ります。未知の項目、非表示・読み取り専用の項目、権限のない項目、編集ツールによる `_status` の変更は拒否します。保存は既存のフォーム送信を使い、Payloadの認証・権限・validation・hooksを通します。下書き保存は通常の下書きボタンと同じく未完成の入力を許容します。

画面遷移・ログアウト・アンマウント時にはAbortSignalでツール登録を解除します。関係先を開くサブドロワーには文書編集ツールを重複登録しません。ツール出力はコンテンツを含むためuntrustedとして扱い、保存ツールには公開影響を示すconsequential hintを付けます。

## 検証

```bash
vp check
vp test run
vp run test:e2e tests/e2e/webmcp.e2e.spec.ts
WEBMCP_NATIVE=1 vp run test:e2e tests/e2e/webmcp.e2e.spec.ts
```

通常のE2EはCIに固定されたChromiumのバージョンに依存しない登録・呼び出しのテスト実装を使います。`WEBMCP_NATIVE=1` は端末にインストール済みのGoogle Chromeを使い、実際のWebMCP登録・発見・実行を検証します。2026年9月の実装ではChrome 153を対象に確認します。

関連: [CLI / MCP](site-tools.md)、[WebMCP Imperative API](https://developer.chrome.com/docs/ai/webmcp/imperative-api)
