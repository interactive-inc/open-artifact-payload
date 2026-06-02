# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Inta CMS

Payload CMS 3 + Next.js 16 (App Router) + Cloudflare (D1/R2/Workers) で構築する Inta CMS テンプレート。管理画面は日本語ローカライズ済み。

## 基本ルール

- 日本語で応答する
- パッケージマネージャーは `bun` を使用する (`pnpm` は使わない)
- ライブラリのダウングレード禁止
- TypeScript / Markdown の詳細ルールは `.claude/rules/` を参照 (`@.claude/rules/ts.md` / `@.claude/rules/md.md`)

## 技術スタック

| カテゴリ               | 技術                                                    |
| ---------------------- | ------------------------------------------------------- |
| CMS                    | Payload CMS 3.84 (`@payloadcms/db-d1-sqlite`)           |
| フレームワーク         | Next.js 16 (App Router)                                 |
| 言語                   | TypeScript 5.7 (`strict: true`)                         |
| データベース           | Cloudflare D1 (SQLite)                                  |
| ストレージ             | Cloudflare R2                                           |
| デプロイ               | Cloudflare Workers (`@opennextjs/cloudflare`)           |
| リッチテキスト         | Lexical Editor (`@payloadcms/richtext-lexical`)         |
| UI ライブラリ          | React 19                                                |
| パッケージマネージャー | bun 1.3+                                                |
| リンター               | ESLint (`next/core-web-vitals`, `next/typescript`)      |
| 統合テスト             | vitest + jsdom + @testing-library/react (`tests/int/`)  |
| E2E テスト             | Playwright / Chromium (`tests/e2e/`)                    |
| UI カタログ            | Storybook 10 (`@storybook/nextjs-vite`) / `.storybook/` |

## ディレクトリ構成の要点

```
src/
  payload.config.ts           Payload CMS 設定 (D1 / R2 / i18n / プラグイン)
  payload-types.ts            Payload 自動生成型定義 (手編集禁止)
  core/                       テンプレ本体。読み取り専用、改変は本体リポジトリへ PR
    collections/              users / media / news / faq / contact-submissions / pages
    globals/site-settings.ts  サイト設定 (グローバル)
    payload/config-base.ts    buildCoreConfig（案件側 payload.config.ts から呼ばれる）
    sections/                 汎用セクション (hero / featured-news / rich-text / cta)
    frontend/                 共通フロントエンド資産 (RefreshRouteOnSave 等)
    lib/                      media / lexical / theme-tokens
    admin/                    管理画面カスタム
  project/                    案件固有。新規ファイルは原則ここに
    pages/                    ページ単位のコロケーション
      home/
        global.ts             Payload Global 定義 (export は <name>Global)
        sections/             このページでのみ使う UI セクション
        components/           このページでのみ使う UI コンポーネント
        hooks/ / lib/         このページでのみ使うフック / util
      about/ service/ ...     下層ページも同じ構造
    shared/                   複数ページで使う資産（2 ページ以上から参照されるもの）
      sections/               site-header / site-footer / contact-cta など
      components/             汎用 UI コンポーネント (フラット配置)
      ui/                     shadcn/ui 所管領域 (bunx shadcn add の配置先)
      hooks/ / lib/           汎用フック / util
    collections/              案件固有コレクション (news/faq 以外)
    theme/tailwind.theme.ts   Tailwind テーマトークン
    admin/                    管理画面カスタム (ダッシュボードタスク等)
  app/(frontend)/             フロントエンドページ (ルート / news / faq / [slug])
  app/(payload)/              Payload の管理画面 / REST / GraphQL
.storybook/                   Storybook 設定 (main.ts / preview.tsx)
tests/int/                    統合テスト (vitest)
tests/e2e/                    E2E テスト (Playwright)
```

Storybook ストーリーは対象コンポーネントと同じディレクトリに `<name>.stories.tsx` としてコロケーションする（例: `src/project/shared/components/button.stories.tsx`）。ストーリー生成は `/add-story` スキルを使う。

コロケーションの運用ルール:

- `pages/<page>/sections` は外から直接 import しない（そのページのみが使う）
- `pages/<page>/components` も同様。他ページで使いたくなったら `shared/components/` に昇格（移動）
- `shared/components/` はフラット配置。サブフォルダで分類しない（20 ファイル超えたら再検討）
- `shared/ui/` は shadcn/ui 所管。手動でファイル追加しない。中身はテーマトークンに合わせて手編集 OK
- 最大階層は 3（`pages/home/sections/hero-section.tsx`）。4 階層以上は作らない

## 開発コマンド

```bash
bun dev                             # 開発サーバー (http://localhost:3000)
bun run devsafe                     # .next / .open-next を消してから dev 起動
bun run build                       # プロダクションビルド
bun run start                       # プロダクションサーバー
make preview                        # Cloudflare Workers ローカルプレビュー
bun run lint                        # ESLint
bun run test                        # vitest + Playwright すべて
bun run test:int                    # 統合テストのみ
bun run test:e2e                    # E2E テストのみ
bun run generate:types              # Cloudflare + Payload 型を生成
bun run generate:importmap          # Payload Import Map 生成
bun run payload migrate             # DB マイグレーション
bun run storybook                   # Storybook 起動 (http://localhost:6006)
bun run build-storybook             # Storybook 静的ビルド (storybook-static/)
```

## デプロイ

Cloudflare Workers (Paid プランが必要)。デプロイ系タスクは `Makefile` に集約している (環境変数を素のシェルで渡すため)。

```bash
make deploy           # DB マイグレーション + アプリ (CLOUDFLARE_ENV のデフォルトは production)
make deploy-app       # アプリのみ
make deploy-db        # DB マイグレーションのみ
```

`CLOUDFLARE_ENV` を上書きすれば別環境にデプロイできる (例: `make deploy CLOUDFLARE_ENV=staging`)。

`wrangler.jsonc` で D1 (binding: `D1`) と R2 (binding: `R2`) を定義している。`database_id` と R2 の `bucket_name` は各自のリソースに合わせて更新する必要がある。

本番環境では `.env` を使わない。Cloudflare Secret Store に登録する:

```bash
wrangler secret put PAYLOAD_SECRET --env=production
# 任意: 利用する場合のみ
wrangler secret put TURNSTILE_SECRET_KEY --env=production
wrangler secret put RESEND_API_KEY --env=production
wrangler secret put CONTACT_NOTIFICATION_EMAIL --env=production
wrangler secret put CONTACT_NOTIFICATION_FROM --env=production
```

staging 環境は `--env=staging` に置き換えて各シークレットを登録する。

## 設計上の非自明ポイント

- `src/payload.config.ts` の Cloudflare コンテキストは `isCLI`/非 production なら `getPlatformProxy` を、本番は `getCloudflareContext` を使い分ける。CLI から `getCloudflareContext` を呼ぶと壊れるので注意。
- 案件固有の Global は `src/project/pages/<page>/global.ts` に置き、`src/payload.config.ts` の `projectGlobals` に import 追加する。export 名は `<name>Global`（例 `homeGlobal`）。
- 案件固有のコレクションは `src/project/collections/*.ts` に置き、`projectCollections` に追加する。
- `src/payload-types.ts` は `bun run generate:types` で再生成する。手で書き換えない。
- Sharp は Cloudflare Workers 上で動かないため、画像の `crop` / `focalPoint` は本番で無効。ローカル dev では動く。
- メディアファイルは R2 (`media` コレクション) 経由でのみ扱う。ローカルファイルシステムには置かない。
- Payload 管理画面 / フロントエンドは `app/(payload)` と `app/(frontend)` のルートグループで分離されている。
- Next.js 16 で `next lint` は削除されたため、`bun run lint` は `eslint .` を直接呼ぶ。Turbopack デフォルトの仕様で webpack 設定が必要な dev/build には `--webpack` を付けて回避している。
- ユーザーは `admin` / `editor` のロールを持つ。コレクションの削除など破壊的操作は admin のみ可能。共通アクセス制御は `src/core/lib/access/` 配下を参照。
- 問い合わせフォーム送信時の通知メールは Resend を使う。`RESEND_API_KEY` / `CONTACT_NOTIFICATION_EMAIL` / `CONTACT_NOTIFICATION_FROM` がすべて設定されたときのみ送信、失敗してもフォーム保存はブロックしない。
- ニュース / ページ更新後は `src/core/lib/revalidate/build-revalidate-hooks.ts` 経由で対象パスを `revalidatePath()` する。案件側で新コレクションを追加した場合も同 hook を使うこと。

## パスエイリアス

- `@/*` → `./src/*`
- `@payload-config` → `./src/payload.config.ts`

## 生成 AI のガードレール

- `src/core/` は読み取り専用。改変したい場合は本体テンプレートリポジトリへ PR を送る
- 新規ファイル作成は原則 `src/project/` 配下に限定する
- 新規コレクション追加時は `src/payload.config.ts` の `projectCollections` への追加を忘れない
- セクションは Payload の `group` フィールドで作り、`enabled` チェックボックスを必ず含める
- フィールドラベルは日本語、フィールド名は lowerCamelCase
- hex 直書き禁止、Tailwind の theme トークンを使う
- 生成後は必ず `bun run lint` と `bun run generate:types` を流す
- 案件の Single Source of Truth は `.docs/project-brief.md`。ここを先に読み込んでから作業する

## 参照

- @README.md
- @package.json
- @wrangler.jsonc
- @portless.json
- @.claude/rules/ts.md
- @.claude/rules/md.md
