# CHANGELOG

利用者の操作・画面・データに影響する変更と、運用上重要な不具合修正を記録します。内部整理やテストのみの変更は含めません。

## 2026-09-04

### 追加

- 問い合わせの通知メールの配信状態を管理画面で確認し、失敗した通知を再送できるようにしました。パスワード再設定などの認証メールも同じ Resend 経由で配信されます（`EMAIL_FROM` で送信元を設定）。 (#19)
- linked worktree を `make worktree` の 1 コマンドで初期化できるようにしました（依存導入、`.env` の引き継ぎ、ローカル D1 のマイグレーション）。 (#28)

### 変更

- CMS の slug・リンク URL・電話番号・文字数・画像の形式と容量にサーバー側の制約を追加しました。既存データの確認には `vp run audit:content` を使います。 (#21)
- Workers の compatibility_date を 2026-07-30 に更新し、observability を有効化しました。staging 環境の雛形を追加し、デプロイ前に必須 secret の登録を検査するようにしました。 (#18)
- リモート D1 に対して Payload CLI を実行するには `CLOUDFLARE_REMOTE_BINDINGS=true` の明示が必要になりました（`make deploy-db` は自動で付与）。`NODE_ENV=production` だけではローカル D1 を使います。 (#12)
- テンプレート更新の取り込み手順を `src/core` だけの subtree 取り込みから、テンプレート main の Git マージへ変更しました。案件は clone で作成し `upstream` remote を保持します。 (#13)
- セットアップの「デプロイモード」から未完成だった SSG を外し、Cloudflare Workers 専用にしました。 (#14)
- 対応する Node.js を 22.18 以上の 22 系、または 24.11 以上に統一しました。`package.json` の `engines` と `.node-version` が正本です。 (#22)
- Makefile の `CLOUDFLARE_ENV=production` の既定をデプロイ系 target だけに限定しました。`make preview` などのローカル操作が本番環境の bindings 定義を参照しなくなります。 (#28)

### 修正

- テンプレートの参照セクション（hero / CTA）が背景色を持たず見出しが白地に白で見えない問題を修正しました。テーマトークンの正本を `styles.css` に一本化しています。 (#37)
- AI 翻訳を同時に実行すると月間の回数・文字数・費用上限を超えられる問題を修正しました。異常終了した実行の予約は 10 分で失効し費用として計上されます。 (#20)
- CTA ボタン、お知らせの日付、フッターのポリシーリンク、削除ボタンの文字色コントラストが WCAG AA (4.5:1) を下回っていたのを修正しました。 (#16)
- macOS 標準の GNU make 3.81 で `make preview` / `make deploy-app` / `make deploy-db` が `opennextjs-cloudflare: No such file or directory` で失敗する問題を修正しました。Makefile の CLI 呼び出しを `vp exec` 経由にしています。 (#28)

## 2026-08-08

### 修正

- CMSのトップページ設定とサイト情報が、ライブプレビューと公開ページに正しく反映されるようにしました。 (#5)
- 制作実績の下書きが公開ページやAPIに表示される問題を修正しました。 (#5)
- ユーザー削除後に残った編集ロックにより、CMSの編集画面やプレビューが表示できなくなる問題を修正しました。 (#5)
