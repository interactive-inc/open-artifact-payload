# CHANGELOG

利用者の操作・画面・データに影響する変更と、運用上重要な不具合修正を記録します。内部整理やテストのみの変更は含めません。

## 2026-09-04

### 追加

- linked worktree を `make worktree` の 1 コマンドで初期化できるようにしました（依存導入、`.env` の引き継ぎ、ローカル D1 のマイグレーション）。 (#28)

### 変更

- Makefile の `CLOUDFLARE_ENV=production` の既定をデプロイ系 target だけに限定しました。`make preview` などのローカル操作が本番環境の bindings 定義を参照しなくなります。 (#28)

### 修正

- macOS 標準の GNU make 3.81 で `make preview` / `make deploy-app` / `make deploy-db` が `opennextjs-cloudflare: No such file or directory` で失敗する問題を修正しました。Makefile の CLI 呼び出しを `vp exec` 経由にしています。 (#28)

## 2026-08-08

### 修正

- CMSのトップページ設定とサイト情報が、ライブプレビューと公開ページに正しく反映されるようにしました。 (#5)
- 制作実績の下書きが公開ページやAPIに表示される問題を修正しました。 (#5)
- ユーザー削除後に残った編集ロックにより、CMSの編集画面やプレビューが表示できなくなる問題を修正しました。 (#5)
