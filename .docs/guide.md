# Inta CMS テンプレート 運用ガイド

## はじめに

このガイドは Inta CMS テンプレートを使ってクライアント向けサイトを構築・運用する開発チーム向けのリファレンスです。テンプレートの目的、セットアップ手順、日常の開発フロー、コンテンツモデルの拡張方法、デプロイ手順、トラブルシューティングを網羅しています。

技術スタックの概要は以下のとおりです。

- CMS: Payload CMS 3.84.1 (`@payloadcms/db-d1-sqlite`)
- フレームワーク: Next.js 16.2.6 (App Router)
- データベース: Cloudflare D1 (SQLite)
- ストレージ: Cloudflare R2
- デプロイ: Cloudflare Workers (`@opennextjs/cloudflare`)
- 言語: TypeScript 5.7 (`strict: true`)
- パッケージマネージャー: bun 1.3+

## セットアップ

### 前提条件

以下のツールを事前にインストールしてください。

- Node.js 20 以上
- bun 1.3 以上
- wrangler CLI (`bun add -g wrangler`)
- Cloudflare アカウント (Workers Paid プランが必要)

### テンプレートからプロジェクトを作成

GitHub の "Use this template" ボタンからリポジトリを複製します。複製後、依存関係をインストールします。

```bash
bun install
```

続いてセットアップスクリプトを実行します。スクリプトは対話形式で以下の質問に答えながら進みます。

```bash
bun run setup:project
```

質問の内容は以下のとおりです。

- 案件 slug (英小文字とハイフン、例: `my-client-2024`)
- デプロイモード (`cloudflare` または `ssg`)
- Cloudflare D1 をいま作成するか (y/N)
- Cloudflare R2 をいま作成するか (y/N)
- `PAYLOAD_SECRET` を自動生成するか (Y/n)

スクリプト完了後、以下のファイルが更新・生成されます。

- `wrangler.jsonc` — Worker 名、D1 database_id、R2 bucket_name が設定される
- `.env` — `PAYLOAD_SECRET` と `NEXT_PUBLIC_SERVER_URL` が書き込まれる
- `.docs/project-brief.md` — プロジェクト概要テンプレートがコピーされる (既存の場合は上書きしない)

D1 / R2 を手動で作成する場合は以下のコマンドを使います。

```bash
wrangler d1 create <slug>
wrangler r2 bucket create <slug>
```

作成後、`wrangler.jsonc` の `database_id` と `bucket_name` を実際の値に更新してください。

### プロジェクト概要の記入

`.docs/project-brief.md` はプロジェクトの Single Source of Truth です。セットアップ完了後すぐに内容を埋めてください。Claude Code でスラッシュコマンドを実行する前に必ず記入済みの状態にしておく必要があります。

記入項目は以下のとおりです。

- クライアント名、業種、目的、納品先 (cloudflare / ssg)
- サイトマップ
- 固定ページの構成とセクション一覧
- 案件固有コレクション定義
- ダッシュボードタスク (優先度付き)
- 汎用ページ機能の有効/無効
- デザイン情報 (キーカラー、アクセント、フォント、雰囲気)

### 初回マイグレーションと起動

D1 データベースに初回マイグレーションを適用します。

```bash
bun run payload migrate
```

その後、開発サーバーを起動します。

```bash
bun dev
```

`http://localhost:3000/admin` にアクセスし、最初の管理者ユーザーを作成します。

## 日常の開発

### 開発コマンド一覧

```bash
bun dev                              # 開発サーバー (http://localhost:3000)
bun run devsafe                      # .next / .open-next を削除してから dev 起動
bun run build                        # プロダクションビルド
bun run start                        # プロダクションサーバー起動
make preview                         # Cloudflare Workers ローカルプレビュー

bun run lint                         # ESLint
bun run test:int                     # vitest 統合テストのみ
bun run test:e2e                     # Playwright E2E テストのみ
bun run test                         # 統合テスト + E2E テスト
bun run test:ci                      # lint + 統合テスト (CI 用)

bun run generate:types               # Payload 型定義 + Cloudflare 型を再生成
bun run generate:importmap           # Payload Import Map 生成

bun run payload migrate              # ローカル D1 にマイグレーション適用
bun run payload migrate:create <name>  # 新規マイグレーションファイル作成
```

### PAYLOAD_MIGRATING 環境変数

通常の `bun dev` では、起動時に `pushDevSchema` が走り D1 スキーマを自動同期しようとします。すでにマイグレーション済みのローカル D1 に対してこれを実行すると、既存インデックスとの衝突で 500 エラーが発生します。

この問題を回避するには `PAYLOAD_MIGRATING=true` を付けて起動します。

```bash
PAYLOAD_MIGRATING=true bun dev
```

この変数を設定すると `pushDevSchema` がスキップされ、既存のスキーマをそのまま使用します。既存マイグレーションが適用済みのローカル環境での通常開発時はこのモードを使用してください。

インデックス競合が発生した場合の解消手順は後述のトラブルシューティングを参照してください。

### 型の再生成

コレクションやグローバルのフィールドを変更したあとは必ず型を再生成します。

```bash
bun run generate:types
```

これにより以下のファイルが更新されます。

- `src/payload-types.ts` — Payload の自動生成型定義
- `cloudflare-env.d.ts` — Cloudflare バインディングの型定義

どちらのファイルも手動で編集してはいけません。

## コンテンツモデルの追加・変更

### コレクションの追加

Claude Code のスラッシュコマンドで追加するのが最も簡単です。

```
/add-collection
```

手動で追加する場合の手順は以下のとおりです。

- `src/project/collections/<slug>.ts` にコレクション定義を作成する
- `src/payload.config.ts` の `buildCoreConfig` の `projectCollections` 配列に追加する
- マイグレーションファイルを作成して適用する

```bash
bun run payload migrate:create <name>
bun run payload migrate
```

- 型を再生成する

```bash
bun run generate:types
```

ライブプレビュー対象にするには `src/payload.config.ts` の `livePreviewCollections` 配列に slug を追加します。フロントエンドに対応するルート (`/news/[slug]` 等) が存在することが前提です。

```typescript
export default buildCoreConfig({
  dirname,
  features: projectFeatures,
  projectGlobals: [homeGlobal],
  livePreviewCollections: ['news', 'tours'], // 追加した slug を列挙
  livePreviewGlobals: ['home-page'],
})
```

### グローバルの追加

固定ページは「1 Global = 1 ページ」の考え方で設計します。グローバルにはそのページの全セクションフィールドを `group` でまとめて定義します。

- `src/project/pages/<page>/global.ts` にグローバル定義を作成する（export 名は `<name>Global`）
- 各 `group` (セクション) には `enabled` チェックボックスを必ず含める
- `src/payload.config.ts` の `projectGlobals` 配列に追加する

```typescript
export default buildCoreConfig({
  dirname,
  features: projectFeatures,
  projectGlobals: [homeGlobal, accessGlobal], // 追加したグローバルを列挙
  livePreviewGlobals: ['home-page', 'access-page'], // ライブプレビュー対象にする場合
})
```

マイグレーションと型再生成を忘れずに実行してください。

### セクションコンポーネントの追加

Claude Code のスラッシュコマンドで生成するのが推奨です。

```
/section-from-design <Figma URL>    # Figma のデザインから生成
/section-from-image                 # スクリーンショット画像から生成
```

手動で追加する場合は置き場所を判定します:

- そのページでしか使わない → `src/project/pages/<page>/sections/<name>.tsx`
- 最初から 2 ページ以上で使う → `src/project/shared/sections/<name>.tsx`

セクションコンポーネントの規約は以下のとおりです。

- `enabled` が `false` のときは `null` を返す
- hex カラー直書き禁止、Tailwind のテーマトークンを使う (`bg-brand`, `text-accent` 等)
- フロントエンドの `page.tsx` でセクションを組み立てる

### 汎用ページ機能の有効化

`pages` コレクション (タイトル、スラッグ、リッチテキスト、SEO) を有効化する場合は `src/project/project-features.ts` を変更します。

```typescript
export const projectFeatures: ProjectFeatures = {
  enableFreePages: true,
}
```

変更後、マイグレーションを作成して適用し、`bun run generate:types` で型を再生成します。SEO プラグインは `enableFreePages` が true のとき自動的に `pages` を対象に含めるため、追加設定は不要です (`config-base.ts` がフラグに応じて切り替えます)。

フロントで固定ページを表示するには、対応する `src/app/(frontend)/[slug]/page.tsx` ルートを案件側で追加してください (テンプレートには同梱していません。`enableFreePages` が false のときは `pages` コレクション型が生成されず、ルートを同梱すると型エラーになるため)。ルートは `payload.find({ collection: 'pages', where: { slug: { equals: params.slug } } })` で取得し、`RichText` で本文を、`generateMetadata` で `doc.meta` を描画します。実装例は `src/app/(frontend)/news/[slug]/page.tsx` を参考にしてください。

## 案件の骨格生成 (AI 活用)

### project-bootstrap スラッシュコマンド

`.docs/project-brief.md` を記入した状態で Claude Code のスラッシュコマンドを実行します。

```
/project-bootstrap
```

これによりブリーフの内容をもとに以下のファイルが一括生成されます。

- `src/project/collections/` 配下の案件固有コレクション定義
- `src/project/pages/<page>/global.ts` の固定ページグローバル定義（export 名は `<name>Global`）
- `src/project/pages/<page>/sections/` と `src/project/shared/sections/` 配下のセクションコンポーネント
- `src/project/admin/dashboard-tasks.ts` のタスク一覧
- `src/project/theme/tailwind.theme.ts` のカラー・フォント設定
- `src/payload.config.ts` の更新

### プロジェクト概要の書き方

`.docs/project-brief.md` の各セクションの意味は以下のとおりです。

プロジェクト概要セクションには、クライアント名・業種・目的・納品先 (cloudflare または ssg) を記入します。

サイトマップセクションには、サイトの全ページを階層的に列挙します。

固定ページの構成セクションには、各固定ページが持つセクションの概要を書きます。例えば「ヒーロー (画像 + キャッチコピー + CTA ボタン)」のように記述します。

案件固有コレクションセクションには、フィールド名と型を簡潔に列挙します。例: `tours: title, slug, thumbnail, departureDate, price, body`

ダッシュボードタスクセクションには、管理者がよく行う操作を `[primary]` / `[secondary]` の優先度付きで列挙します。

デザインセクションには、キーカラーの hex 値、アクセントカラー、フォント名、全体的な雰囲気を記入します。

## 管理画面のカスタマイズ

### ダッシュボードタスク

`src/project/admin/dashboard-tasks.ts` を編集します。`DashboardTask` 型の定義は以下のとおりです。

- `id` — 一意の識別子 (文字列)
- `icon` — アイコン名 (後述)
- `label` — ボタンに表示するラベル
- `description` — 補足説明 (任意)
- `href` — リンク先 URL (管理画面内のパス)
- `priority` — `'primary'` または `'secondary'`

使用できるアイコン名は以下のとおりです。

- `megaphone` — お知らせ系
- `home` — トップページ系
- `image` — 画像・メディア系
- `map` — 地図・所在地系
- `users` — ユーザー管理系
- `fileText` — 文書・ページ系
- `mail` — 問い合わせ系
- `settings` — 設定系
- `helpCircle` — ヘルプ系

### ライブプレビュー

ライブプレビューの仕組みは以下のとおりです。

- 管理画面のエディタが iframe を開き `/next/preview` ルートにリクエストする
- `/next/preview` が Next.js の Draft Mode を有効にして指定パスにリダイレクトする
- フロントエンドの `page.tsx` が Draft Mode を検出してドラフトデータを表示する
- `RefreshRouteOnSave` コンポーネントが保存時に自動でリフレッシュする

`src/payload.config.ts` の `livePreviewCollections` / `livePreviewGlobals` に slug を列挙するだけで有効になります。フロントエンドに対応するルートが存在しない slug を指定してもプレビューは機能しません。

プレビュー URL の解決ロジックは `src/core/payload/config-base.ts` の `livePreview.url` 関数で定義されています。`home-page` グローバルは `/` に、その他のグローバルは `/<slug>` に、コレクションは `/<collectionSlug>/<documentSlug>` にマップされます。

### 公開サイトリンク

管理画面サイドバーの「公開サイトを開く」リンクは `src/core/admin/nav/open-public-site.tsx` で定義されています。クリックすると `/next/exit-preview` 経由で Draft Mode が解除された状態でフロントエンドが開きます。

## テーマとデザイン

### Tailwind テーマトークン

ブランドカラーとフォントは `src/project/theme/tailwind.theme.ts` で定義します。hex カラーはこのファイルにのみ記述し、コンポーネント内では Tailwind クラスを使います。

```typescript
export const projectTailwindTheme = {
  colors: {
    brand: {
      DEFAULT: '#1a5f7a',
      light: '#3a7a94',
      dark: '#0f4558',
    },
    accent: {
      DEFAULT: '#ff6b35',
    },
  },
  fontFamily: {
    sans: ['"Noto Sans JP"', 'Hiragino Sans', 'sans-serif'],
  },
}
```

これにより以下の Tailwind クラスが使用可能になります。

- `bg-brand` / `bg-brand-light` / `bg-brand-dark`
- `text-brand` / `text-brand-light` / `text-brand-dark`
- `bg-accent` / `text-accent`
- `font-sans` (日本語フォントスタック)

### 管理画面の日本語化

i18n は `@payloadcms/translations/languages/ja` を使って自動的に日本語化されています。追加設定は不要です。

フィールドのラベルは日本語で記述し、フィールド名 (プロパティ名) は lowerCamelCase で統一します。

## デプロイ

### Cloudflare Workers (デフォルト)

デプロイには Cloudflare Workers Paid プランが必要です。

デプロイ系タスクは `Makefile` に集約しています。

```bash
make deploy            # DB マイグレーション + アプリデプロイ (CLOUDFLARE_ENV のデフォルトは production)
make deploy-app        # アプリのみ (マイグレーション済みの場合)
make deploy-db         # DB マイグレーションのみ
```

`make deploy-db` は内部で以下を実行します。

- `payload migrate` をリモート D1 に対して適用
- `wrangler d1 execute D1 --command 'PRAGMA optimize'` でクエリプランを最適化

デプロイ前に `wrangler.jsonc` の以下を本番環境の値に更新してください。

- `d1_databases[0].database_id` — Cloudflare D1 データベース ID
- `r2_buckets[0].bucket_name` — Cloudflare R2 バケット名

### 環境変数

本番環境で設定が必要な環境変数は以下のとおりです。

- `PAYLOAD_SECRET` — 必須。`openssl rand -hex 32` で生成した 32 バイトのランダム文字列
- `NEXT_PUBLIC_SERVER_URL` — ライブプレビューの URL 解決に使用。デプロイ先の URL を設定
- `TURNSTILE_SECRET_KEY` — 問い合わせフォームの Cloudflare Turnstile 検証用 (サーバー側シークレット)
- `RESEND_API_KEY` — メール通知 (任意)
- `SUPPORT_EMAIL` — ダッシュボードのヘルプリンク用 (任意)
- `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` — CI やバックアップ自動化用 (任意)

ローカル開発では `.env` ファイルに設定します。`TURNSTILE_SECRET_KEY` が未設定の場合、ローカル開発として Turnstile 検証がスキップされます。本番では必ず設定してください。

Turnstile の公開サイトキー (フロントエンド用) は環境変数ではなく、管理画面の「サイト設定」グローバルの `turnstileSiteKey` で設定します。サイトキーが設定されると問い合わせフォームが Turnstile ウィジェットを読み込みます。

### SSG モード (骨格)

`bun run setup:project` で `ssg` を選択すると SSG モードが適用されます。これは xserver 等 Node.js が動かない環境向けの静的書き出し用モードです。

SSG モード適用時の変更内容は以下のとおりです。

- `src/app/(payload)/` ディレクトリを削除 (管理画面は弊社管理の別 Cloudflare にホスト)
- `src/app/(frontend)/contact/` および問い合わせ関連ファイルを削除 (Server Action は `output: 'export'` と両立しないため)
- `wrangler.jsonc` を削除
- `next.config.ts` に `output: 'export'` と `unoptimized: true` を追加
- `.github/workflows/deploy-static.yml` を生成

SSG モードは現時点では骨格のみです。Payload REST API の接続先設定、rsync の詳細、本番での問い合わせ受付方法は第一案件で詰める予定です。

## テンプレート更新の取り込み

### 更新手順

テンプレート本体に修正や機能追加があった場合、`src/core/` 配下を更新します。

```bash
git remote add upstream <テンプレートリポジトリURL>
git subtree pull --prefix=src/core upstream main
bun run generate:types
bun run test:int
```

テストが通ることを確認してから案件ブランチにマージしてください。

### 注意点

`src/core/` 配下のファイルは案件側で直接変更しないでください。テンプレート本体への改善はリポジトリに PR を送ります。

マイグレーションの競合に注意してください。テンプレート側のマイグレーションと案件側のマイグレーションが衝突する場合は、マイグレーションファイルのタイムスタンプとスキーマ差分を慎重に確認してください。

## ディレクトリ構成

### src/core/ (テンプレート本体、読み取り専用)

`src/core/` 配下は案件ごとに変更しません。改善が必要な場合はテンプレートリポジトリへ PR を送ります。

- `src/core/collections/` — ビルトインコレクション定義 (users, media, news, faq, pages, contact-submissions)
- `src/core/globals/` — ビルトイングローバル定義 (site-settings)
- `src/core/admin/` — 管理画面カスタムコンポーネント (ダッシュボード、ナビゲーション、テーマ)
- `src/core/frontend/` — フロントエンド共通コンポーネントとフォーム
- `src/core/sections/` — ビルトインセクションコンポーネント
- `src/core/payload/` — Payload 設定ビルダー (`config-base.ts`)
- `src/core/lib/` — 共通ユーティリティ
- `src/core/scripts/` — セットアップスクリプト群

### src/project/ (案件ごとにカスタマイズ)

案件固有のファイルはすべて `src/project/` 配下に置きます。

- `src/project/pages/<page>/` — ページ単位のコロケーション (global.ts / sections/ / components/ / hooks/ / lib/)
- `src/project/shared/` — 複数ページで使う資産 (sections / components / ui / hooks / lib)
- `src/project/collections/` — 案件固有コレクション定義
- `src/project/admin/dashboard-tasks.ts` — ダッシュボードのクイックアクション一覧
- `src/project/theme/tailwind.theme.ts` — ブランドカラー・フォント定義
- `src/project/project-features.ts` — 機能フラグ (`enableFreePages` 等)
- `src/project/types.ts` — プロジェクト固有の型定義

### Payload 設定のエントリポイント

`src/payload.config.ts` が Payload のエントリポイントです。`buildCoreConfig` にプロジェクト固有の設定を渡します。

```typescript
export default buildCoreConfig({
  dirname,
  features: projectFeatures,         // 機能フラグ
  projectCollections: [...],          // 案件固有コレクション
  projectGlobals: [homeGlobal],       // 案件固有グローバル
  livePreviewCollections: ['news'],   // ライブプレビュー対象コレクション slug
  livePreviewGlobals: ['home-page'],  // ライブプレビュー対象グローバル slug
})
```

### テスト

- `tests/int/` — vitest 統合テスト (Node.js 環境、ファイル単位で jsdom)
- `tests/e2e/` — Playwright E2E テスト (Chromium)
- `tests/helpers/` — テスト用ヘルパー (ユーザー作成 `seedUser.ts`、ログイン `login.ts`)

### GitHub Actions ワークフロー

`.github/workflows/` に 2 つのワークフローが用意されています。

- `ci.yml` — push to main / PR で lint + 統合テストを自動実行
- `backup-d1.yml` — 週次 (毎週月曜 0:00 JST) で D1 をダンプし R2 にバックアップ

テンプレートリポジトリでは両方 `disabled_manually` にしています。案件で CI を使い始めるタイミングで以下のコマンドで有効化してください。

```bash
gh workflow enable ci
gh workflow enable backup-d1
```

CI を動かすには GitHub リポジトリの Settings > Secrets に以下を設定します。

- `PAYLOAD_SECRET` — Payload 用シークレット (統合テストは vitest.setup.ts のテスト専用フォールバックで動作する。本番は未設定だと起動失敗する)
- `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` — バックアップワークフロー用 (ci.yml には不要)

無効化するには以下のコマンドです。

```bash
gh workflow disable ci
gh workflow disable backup-d1
```

## トラブルシューティング

### dev 起動で 500 エラー (CREATE INDEX 競合)

原因: `bun dev` 起動時の `pushDevSchema` が既存 D1 インデックスと衝突している。

解決手順は以下のとおりです。

- ローカル D1 の状態ディレクトリを削除する

```bash
rm -rf .wrangler/state/v3/d1/miniflare-D1DatabaseObject
```

- マイグレーションを再適用する

```bash
bun run payload migrate
```

- `PAYLOAD_MIGRATING=true` を付けて起動する

```bash
PAYLOAD_MIGRATING=true bun dev
```

### array フィールドのマイグレーションと autosave

`type: 'array'` フィールドを持つ Global/Collection でマイグレーションを手動作成する場合、version 用の array サブテーブルに `_uuid` カラムを含める必要があります。Payload は version の array 項目を `_uuid` で追跡しているため、このカラムが欠落すると autosave/publish 時に array データが version テーブルにコピーされず、admin 画面で入力が消える現象が発生します。

`migrate:create` がインタラクティブ入力を求めて失敗し、手動でマイグレーション SQL を書く場合は特に注意してください。dev-push (`bun dev` 起動時に自動生成されるスキーマ) と手動マイグレーションのテーブル定義が一致しているか、以下のコマンドで比較確認できます。

```bash
bunx wrangler d1 execute D1 --local --command="PRAGMA table_info(_<global>_v_version_<array_field>)"
```

dev-push で生成されるスキーマが正解なので、開発中は `PAYLOAD_MIGRATING` なしの `bun dev` で dev-push に任せ、本番デプロイ時のみマイグレーションを整備するのが安全です。

関連 Issue:

- [Autosave with SQLite interfering with publishing (payloadcms/payload#8659)](https://github.com/payloadcms/payload/issues/8659)
- [Migrations ドキュメント](https://payloadcms.com/docs/database/migrations) — dev-push とマイグレーションの併用は推奨されていない

### マイグレーション作成時の注意

SQLite の二重引用符フォールバック問題に注意してください。生成されたマイグレーション SQL で `INSERT INTO ... SELECT` を使う場合、新規カラムに既存テーブルから値を SELECT すると文字列リテラルとして解釈される場合があります。

既存データがある状態でカラムのデフォルト値を設定する場合は、`'published'` や `NULL` などのリテラルを明示的に指定してください。マイグレーションファイル (`src/migrations/` 配下) を必ず内容確認してから `bun run payload migrate` を実行してください。

### ライブプレビューが表示されない

以下を確認してください。

- `livePreviewCollections` / `livePreviewGlobals` に対象の slug が含まれているか
- フロントエンドに対応するルートが存在するか (例: `src/app/(frontend)/news/[slug]/page.tsx`)
- 管理画面に管理者でログイン済みか (`/next/preview` は Payload 認証を通す)
- `NEXT_PUBLIC_SERVER_URL` が正しい URL を指しているか

### 問い合わせフォームが動かない

`TURNSTILE_SECRET_KEY` が未設定のときはローカル開発モードとして Turnstile 検証がスキップされます。フォームが送信できない場合は以下を確認してください。

- 本番環境で `TURNSTILE_SECRET_KEY` と `TURNSTILE_SITE_KEY` が設定されているか
- Turnstile のサイトキーがドメインに紐づいているか (Cloudflare ダッシュボードで確認)

### bun run build が失敗する

メモリ不足が原因の場合は `build` スクリプトに `--max-old-space-size=8000` が付いているため、ホストに 8GB 以上のメモリが必要です。

型エラーが原因の場合は `bun run generate:types` を実行してから再ビルドしてください。
