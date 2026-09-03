# Inta CMS

Payload CMS 3 + Next.js 16 + Cloudflare (D1 / R2 / Workers) で構築したコーポレートサイトのテンプレート。管理画面は日本語ローカライズ済み。

Cloudflare Workers 専用です（Vercel 等の他プラットフォームには未対応）。DB は D1、画像ストレージは R2、デプロイは `@opennextjs/cloudflare` を前提に作られています。

## 技術スタック

- CMS: Payload CMS 3 (`@payloadcms/db-d1-sqlite`)
- フレームワーク: Next.js 16 (App Router) / React 19 / TypeScript
- インフラ: Cloudflare D1 + R2 + Workers
- ツールチェーン: Vite+ / Bun

## リポジトリ構成

このリポジトリは Bun workspace のモノレポです。既存サイトをルート workspace に保ち、外部操作の境界を独立パッケージに分けています。

- ルート — Next.js / Payload のサイト本体
- `packages/site-management` — CLI向けサイト管理の Domain / Application / Infrastructure と composition root
- `packages/cli` — Hiract型の `intacms` CLI（環境設定、JWTログイン、REST型コマンド）
- ルートの Payload — 公式 `@payloadcms/plugin-mcp` による Streamable HTTP MCP サーバー

設計判断は `.docs/architecture.md` と `.docs/domain.md`、操作手順は `.docs/features/site-tools.md` を参照してください。

## セットアップ

前提: bun 1.3+ / wrangler CLI / Cloudflare アカウント

```bash
vp install

# Worker / Account / D1 / R2 を案件固有の値へ更新する
# D1 と R2 は対話中に新規作成できる
vp run setup:project

# D1 を後から作成した場合は env.production.d1_databases の ID を更新する
vp exec wrangler d1 create <project-slug>-cms

# ローカル D1 にマイグレーション + サンプルデータ投入
vp run payload migrate
vp run seed

vp run dev
```

起動後、フロントは http://localhost:3000 、管理画面は http://localhost:3000/admin 。初回アクセス時にユーザー作成画面が表示されます。

## 公開までにすることリスト

これをベースに案件サイトを作って公開するまでのチェックリスト。

コンテンツ・ブランド:

- [ ] 管理画面のサイト設定を入力する（サイト名 / ロゴ / 会社情報 / ヘッダー・フッターナビ / SNS / GA・GTM の ID）
- [ ] favicon を差し替える（`src/app/icon.svg`、いまは仮の S アイコン）
- [ ] OG デフォルト画像を差し替える（`public/og-default.png`、いまは SAMPLE inc. のプレースホルダ）
- [ ] トップページのハードコードされたサンプルデータを実データまたは CMS に置き換える（`src/project/pages/home/sections/home-grid.tsx` の実績数値・使用技術・お客様の声）
- [ ] news / works のダミー記事を削除して実コンテンツを入れる

インフラ・デプロイ:

- [ ] `vp run setup:project` で Worker / Account ID / D1 / R2 を案件固有の値にする
- [ ] `make deploy-preflight` が成功し、ローカルと本番で Worker / D1 / R2 が分離されていることを確認する
- [ ] 本番シークレットを登録する（`PAYLOAD_SECRET` と、問い合わせフォームを残す場合の `TURNSTILE_SECRET_KEY` は必須。Resend は通知を使う場合のみ）
- [ ] `wrangler.jsonc` の `CONTACT_RATE_LIMITER` の `namespace_id` がCloudflareアカウント内で一意か確認する
- [ ] `.env` の `NEXT_PUBLIC_SERVER_URL` を本番ドメインにする（ビルド時に焼き込まれ、sitemap / OG の URL が参照する）
- [ ] `make deploy-db` でリモート D1 に migrate してから `make deploy-app` を実行する（順序が逆だとビルドが `no such table` で落ちる）
- [ ] Workers に独自ドメインを設定する

任意・判断が必要:

- [ ] 問い合わせフォームを残す場合はTurnstileサイトキーをサイト設定に、`TURNSTILE_SECRET_KEY`をSecret Storeに登録する（本番の設定不足はfail-closed）
- [ ] 問い合わせ通知メール (Resend) を使うか決める。`RESEND_API_KEY` / `CONTACT_NOTIFICATION_EMAIL` / `CONTACT_NOTIFICATION_FROM` の3つが揃ったときのみ送信される
- [ ] staging 環境が必要か決める。`wrangler.jsonc` に `env.staging` の雛形があるので、staging 用の D1 と R2 を作成して `database_id` を埋めれば `make deploy CLOUDFLARE_ENV=staging` でデプロイできる。secret は `--env=staging` で別途登録する
- [ ] `.docs/tasks.md` の「人間の判断が必要なタスク」を一読して、デフォルトのままでよいか確認する

## コレクションとグローバル

- お知らせ `news` — カテゴリ・公開日・サムネイル・SEO
- FAQ `faq` — カテゴリ・表示順
- 制作実績 `works` — カテゴリ・サムネイル・本文・SEO（案件固有コレクションの実装例）
- お問い合わせ `contact-submissions` — フォームの受信内容
- メディア `media` — 画像アップロード（R2）
- ユーザー `users` — 管理者 (admin) / 編集者 (editor)
- ページ `pages` — 汎用ページ。`src/project/project-features.ts` の `enableFreePages: true` で有効化（デフォルト無効）
- サイト設定 `site-settings`（グローバル）— サイト名・ロゴ・会社情報・ナビ・SNS・計測タグ・Turnstile サイトキー

## デプロイ

Paid Workers プランが必要です（Worker サイズ制限のため）。

```bash
make deploy-db        # リモート D1 へマイグレーション
make deploy-app       # ビルド + デプロイ
make deploy           # 上記2つをまとめて実行
make deploy-preflight # デプロイ設定のみ検査
make preview          # ローカルで Workers ランタイムを使ったプレビュー
```

`make preview` はトップレベルのローカル専用 D1 / R2 を使用します。`make deploy*` は
`env.production` を明示し、事前検査で Account ID、Worker名、D1 ID、R2名の未設定・不一致・環境間重複と、必須シークレットの登録漏れを拒否します。

制限事項:

- Sharp が Workers 上で動かないため、画像の crop / focalPoint は本番では無効
- `vp run build` の SSG プリレンダーはローカル D1 を使い、Cloudflare アカウントや本番 D1 の状態には依存しない。リモート D1 の migrate はデプロイ前に `make deploy-db` で行うこと

## コマンド一覧

```bash
vp run dev                      # 開発サーバー
vp run build                    # プロダクションビルド
vp lint                         # lint
vp fmt                          # フォーマット確認
vp test                         # Vite+ のテスト
vp check                        # format + lint + 型チェック
vp run test                     # 統合テスト + E2E すべて
vp run intacms --help           # サイト操作 CLI のヘルプ
vp run payload migrate          # ローカル D1 にマイグレーション
vp run seed                     # サンプルデータ投入
vp run generate:types           # Cloudflare + Payload の型生成
vp run storybook                # Storybook (http://localhost:6006)
```

詳細な運用ガイドは `.docs/guide.md` を参照してください。
