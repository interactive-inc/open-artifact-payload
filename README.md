# Inta CMS

Payload CMS 3 + Next.js + Cloudflare (D1 + R2 + Workers) で構築した Inta CMS テンプレート。

管理画面は日本語ローカライズ済み。Cloudflare D1 (SQLite) + R2 (ストレージ) で動作し、Cloudflare Workers にデプロイ可能。

## Tech Stack

- CMS: Payload CMS 3 (`@payloadcms/db-d1-sqlite`)
- Framework: Next.js 16 (App Router)
- Database: Cloudflare D1 (SQLite)
- Storage: Cloudflare R2
- Deploy: Cloudflare Workers (`@opennextjs/cloudflare`)
- Language: TypeScript
- Runtime: bun

## セットアップ

### 前提条件

- Node.js 20+
- bun 1.3+
- wrangler CLI (`bun add -g wrangler`)
- Cloudflare アカウント

### 依存関係のインストール

```bash
bun install
```

### Cloudflare リソースの作成

```bash
# D1 データベース作成
wrangler d1 create open-artifact-payload

# R2 バケット作成
wrangler r2 bucket create open-artifact-payload
```

`wrangler.jsonc` の `database_id` と R2 の `bucket_name` を自分の Cloudflare リソースに合わせて更新してください。`bun run setup:project` を使うと自動置換されます。

### 環境変数 (ローカル開発)

```bash
cp .env.example .env
```

`.env` を編集して `PAYLOAD_SECRET` を設定:

```env
PAYLOAD_SECRET=$(openssl rand -hex 32)
```

問い合わせ通知メール (Resend) を使う場合は `.env.example` の以下も設定:

```env
RESEND_API_KEY=re_xxx
CONTACT_NOTIFICATION_EMAIL=admin@example.com
CONTACT_NOTIFICATION_FROM="Contact <noreply@example.com>"
```

3 つすべて設定された場合のみ通知が送信されます（未設定なら CMS への保存だけ実施）。

### マイグレーション

```bash
bun run payload migrate
```

### 開発サーバー起動

```bash
bun dev
```

起動後:

- フロントページ: http://localhost:3000
- 管理画面: http://localhost:3000/admin

初回アクセス時にユーザー作成画面が表示されます。

## コレクション

| コレクション | Slug | グループ | 説明 |
|---|---|---|---|
| お知らせ | `news` | コンテンツ | ニュース・告知（カテゴリ、公開日、サムネイル） |
| FAQ | `faq` | コンテンツ | よくある質問（カテゴリ、表示順） |
| 制作実績 | `works` | コンテンツ | 制作実績（カテゴリ、サムネイル、本文）。案件固有コレクション |
| お問い合わせ | `contact-submissions` | コンテンツ | 問い合わせフォームの受信内容 |
| メディア | `media` | システム | 画像アップロード（R2 ストレージ） |
| ユーザー | `users` | システム | 管理者・編集者 |
| ページ（任意） | `pages` | コンテンツ | 汎用Webページ。`src/project/project-features.ts` の `enableFreePages: true` で有効化（デフォルト無効） |

## グローバル設定

- サイト設定 (`site-settings`): サイト名、ロゴ、フッター、SNSリンク

## 管理画面のカスタマイズ

- 日本語ローカライズ（UIラベル、日付フォーマット）
- 日本語フォントスタック（Hiragino Sans, Noto Sans JP 等）
- 角丸・余白の改善
- ダッシュボードに各コレクションの件数ウィジェット
- コレクションのグループ分け（コンテンツ / システム）

## Cloudflare デプロイ

注意: Paid Workers プランが必要（サイズ制限のため）。

### 本番シークレットの登録 (必須)

`.env` の値はローカル開発専用。本番 (Cloudflare Workers) では Secret Store にシークレットを登録してください。

```bash
# 必須
wrangler secret put PAYLOAD_SECRET --env=production

# 任意 (利用する場合のみ)
wrangler secret put TURNSTILE_SECRET_KEY --env=production
wrangler secret put RESEND_API_KEY --env=production
wrangler secret put CONTACT_NOTIFICATION_EMAIL --env=production
wrangler secret put CONTACT_NOTIFICATION_FROM --env=production
```

staging 環境は `--env=staging` を指定。各環境ごとに別途登録が必要です。

### Wrangler CLI

デプロイ系タスクは `Makefile` に集約しています。

```bash
# データベースマイグレーション（リモート）
make deploy-db

# ビルド + デプロイ
make deploy-app
```

### staging 環境

`wrangler.jsonc` の `env.staging` を有効化済み。`<REPLACE_WITH_YOUR_STAGING_DATABASE_ID>` を staging 用に作成した D1 の ID に差し替え、staging 用 R2 バケットを作成してから:

```bash
make deploy CLOUDFLARE_ENV=staging
```

### GitHub 連携

- GitHub にリポジトリを push
- Cloudflare Dashboard > Workers & Pages > プロジェクト作成
- GitHub リポジトリを選択
- ビルドコマンド: `bun run build`
- 環境変数 `PAYLOAD_SECRET` に本番用シークレットキーを設定

### 制限事項

- Sharp（画像処理）は Cloudflare Workers で動作しないため、画像の crop / focalPoint は無効
- ファイルアップロードは R2 を使用（ローカルファイルシステムではない）
- wrangler.jsonc の D1/R2 バインディング ID は各自のリソースに合わせて更新が必要

## コマンド一覧

```bash
bun dev                         # 開発サーバー起動
bun run build                   # プロダクションビルド
bun run start                   # プロダクションサーバー起動
make deploy                     # DB マイグレーション + デプロイ
make deploy-app                 # アプリのみデプロイ
make deploy-db                  # DB マイグレーションのみ
bun run generate:types          # Payload 型定義の生成
bun run generate:importmap      # Import map の生成
make preview                    # ローカルで Cloudflare Workers プレビュー
```
