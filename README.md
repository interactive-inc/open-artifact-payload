# Inta CMS

Payload CMS 3 + Next.js 16 + Cloudflare (D1 / R2 / Workers) で構築したコーポレートサイトのテンプレート。管理画面は日本語ローカライズ済み。

Cloudflare Workers 専用です（Vercel 等の他プラットフォームには未対応）。DB は D1、画像ストレージは R2、デプロイは `@opennextjs/cloudflare` を前提に作られています。

## 技術スタック

- CMS: Payload CMS 3 (`@payloadcms/db-d1-sqlite`)
- フレームワーク: Next.js 16 (App Router) / React 19 / TypeScript
- インフラ: Cloudflare D1 + R2 + Workers
- ランタイム / パッケージマネージャー: bun

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

# D1 と R2 を作成し、wrangler.jsonc の database_id / bucket_name を差し替える
# (bun run setup:project で対話的に自動置換できる)
wrangler d1 create <project-name>
wrangler r2 bucket create <project-name>

# 環境変数 (PAYLOAD_SECRET は openssl rand -hex 32 で生成)
cp .env.example .env

# ローカル D1 にマイグレーション + サンプルデータ投入
bun run payload migrate
bun run seed

bun dev
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

- [ ] `wrangler.jsonc` の `database_id` / `bucket_name` を本番リソースに差し替える
- [ ] 本番シークレットを登録する（`wrangler secret put PAYLOAD_SECRET --env=production` は必須。Turnstile / Resend を使う場合はそれぞれのキーも）
- [ ] `.env` の `NEXT_PUBLIC_SERVER_URL` を本番ドメインにする（ビルド時に焼き込まれ、sitemap / OG の URL が参照する）
- [ ] `make deploy-db` でリモート D1 に migrate してから `make deploy-app` を実行する（順序が逆だとビルドが `no such table` で落ちる）
- [ ] Workers に独自ドメインを設定する

任意・判断が必要:

- [ ] 問い合わせのスパム対策 (Turnstile) を使うか決める。使うならサイトキーをサイト設定に、シークレットを Secret Store に登録
- [ ] 問い合わせ通知メール (Resend) を使うか決める。`RESEND_API_KEY` / `CONTACT_NOTIFICATION_EMAIL` / `CONTACT_NOTIFICATION_FROM` の3つが揃ったときのみ送信される
- [ ] staging 環境が必要なら `wrangler.jsonc` の `env.staging` に staging 用 D1 / R2 を設定して `make deploy CLOUDFLARE_ENV=staging`
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
make preview          # ローカルで Workers ランタイムを使ったプレビュー
```

制限事項:

- Sharp が Workers 上で動かないため、画像の crop / focalPoint は本番では無効
- `bun run build` の SSG プリレンダーはリモート D1 に接続する。先にリモートへ migrate を当てること

## コマンド一覧

```bash
bun dev                         # 開発サーバー
bun run build                   # プロダクションビルド
bun run lint                    # vp lint (lint + 型チェック)
bun run check                   # vp check (フォーマット + lint + 型チェック)
bun run test                    # 統合テスト + E2E すべて
bun run test:tools              # CLI / site-management のユニットテスト
bun run intacms --help          # サイト操作 CLI のヘルプ
bun run intacms commands        # 公開リソースと操作の一覧
bun run payload migrate         # ローカル D1 にマイグレーション
bun run seed                    # サンプルデータ投入
bun run generate:types          # Cloudflare + Payload の型生成
bun run storybook               # Storybook (http://localhost:6006)
```

詳細な運用ガイドは `.docs/guide.md` を参照してください。
