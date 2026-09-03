# CHANGELOG

利用者の操作・画面・データに影響する変更と、運用上重要な不具合修正を記録します。内部整理やテストのみの変更は含めません。

## 2026-09-04

### 追加

- linked worktree を `make worktree` の 1 コマンドで初期化できるようにしました（依存導入、`.env` の引き継ぎ、ローカル D1 のマイグレーション）。 (#28)

### 変更

- テンプレート更新の取り込み手順を `src/core` だけの subtree 取り込みから、テンプレート main の Git マージへ変更しました。案件は clone で作成し `upstream` remote を保持します。 (#13)
- セットアップの「デプロイモード」から未完成だった SSG を外し、Cloudflare Workers 専用にしました。 (#14)
- 対応する Node.js を 22.18 以上の 22 系、または 24.11 以上に統一しました。`package.json` の `engines` と `.node-version` が正本です。 (#22)
- Makefile の `CLOUDFLARE_ENV=production` の既定をデプロイ系 target だけに限定しました。`make preview` などのローカル操作が本番環境の bindings 定義を参照しなくなります。 (#28)

### 修正

- macOS 標準の GNU make 3.81 で `make preview` / `make deploy-app` / `make deploy-db` が `opennextjs-cloudflare: No such file or directory` で失敗する問題を修正しました。Makefile の CLI 呼び出しを `vp exec` 経由にしています。 (#28)

## 2026-08-08

### 修正

- CMSのトップページ設定とサイト情報が、ライブプレビューと公開ページに正しく反映されるようにしました。 (#5)
- 制作実績の下書きが公開ページやAPIに表示される問題を修正しました。 (#5)
- ユーザー削除後に残った編集ロックにより、CMSの編集画面やプレビューが表示できなくなる問題を修正しました。 (#5)
