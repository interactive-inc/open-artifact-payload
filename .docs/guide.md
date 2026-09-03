# Inta CMS テンプレート 運用ガイド

## はじめに

このガイドは Inta CMS テンプレートを使ってクライアント向けサイトを構築・運用する開発チーム向けのリファレンスです。テンプレートの目的、セットアップ手順、日常の開発フロー、コンテンツモデルの拡張方法、デプロイ手順、トラブルシューティングを網羅しています。

技術スタックの概要は以下のとおりです。

- CMS: Payload CMS 3.87.0 (`@payloadcms/db-d1-sqlite`)
- フレームワーク: Next.js 16.2.12 (App Router)
- データベース: Cloudflare D1 (SQLite)
- ストレージ: Cloudflare R2
- デプロイ: Cloudflare Workers (`@opennextjs/cloudflare`)
- 言語: TypeScript 5.7.3 (`strict: true`)
- ツールチェーン: Vite+ 0.2.7
- ランタイム / パッケージマネージャー: Bun 1.3.14

## セットアップ

### 前提条件

以下のツールを事前にインストールしてください。

- Node.js `^18.20.2` または `20.9.0` 以上
- Vite+ (`vp` コマンド)
- Cloudflare アカウント (Free / Paid は Worker サイズと利用量に応じて選択)

### テンプレートからプロジェクトを作成

GitHub の "Use this template" ボタンからリポジトリを複製します。複製後、依存関係をインストールします。

```bash
vp install
```

続いてセットアップスクリプトを実行します。スクリプトは対話形式で以下の質問に答えながら進みます。

```bash
vp run setup:project
```

質問の内容は以下のとおりです。

- 案件 slug (英小文字とハイフン、例: `my-client-2024`)
- デプロイモード (`cloudflare` または `ssg`)
- Cloudflare Account ID (Cloudflare モードのみ)
- Cloudflare D1 をいま作成するか (y/N)
- 既存の D1 database_id (D1 を作成しない場合。未作成なら空欄)
- Cloudflare R2 をいま作成するか (y/N)
- `PAYLOAD_SECRET` を自動生成するか (Y/n)

スクリプト完了後、以下のファイルが更新・生成されます。

- `wrangler.jsonc` — ローカルと本番を分離した Worker 名、Account ID、D1、R2 が設定される
- `.env` — `PAYLOAD_SECRET` と `NEXT_PUBLIC_SERVER_URL` が書き込まれる
- `.docs/project-brief.md` — プロジェクト概要テンプレートがコピーされる (既存の場合は上書きしない)

D1 / R2 を手動で作成する場合は以下のコマンドを使います。

```bash
vp exec wrangler d1 create <slug>-cms
vp exec wrangler r2 bucket create <slug>-cms
```

作成後、`wrangler.jsonc` の `env.production.d1_databases[0].database_id` を実際の値に更新してください。
R2 のバケット名は `<slug>-cms` です。トップレベルはローカル専用なので `database_id` を追加せず、
`remote: false` のままにします。

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
vp run payload migrate
```

その後、開発サーバーを起動します。

```bash
vp run dev
```

`http://localhost:3000/admin` にアクセスし、最初の管理者ユーザーを作成します。

## 日常の開発

### 開発コマンド一覧

```bash
vp run dev                           # 開発サーバー (http://localhost:3000)
vp run devsafe                       # .next / .open-next を削除してから dev 起動
vp run build                         # プロダクションビルド
vp run start                         # プロダクションサーバー起動
make preview                         # Cloudflare Workers ローカルプレビュー

vp check                             # フォーマット + lint + 型チェック
vp test                              # Vite+ / Vitest テスト
vp run test:e2e                      # Playwright E2E テストのみ
vp run test                          # 統合テスト + E2E テスト
vp run test:ci                       # lint + 統合テスト (CI 用)

vp run generate:types                # Payload 型定義 + Cloudflare 型を再生成
vp run generate:importmap            # Payload Import Map 生成

vp run payload migrate               # ローカル D1 にマイグレーション適用
vp run payload migrate:create <name> # 新規マイグレーションファイル作成
```

### ローカル D1 のスキーマ管理

D1 アダプターは `push: false` で構成されており、開発環境でもスキーマ変更はマイグレーションで管理します。コレクションやグローバルの定義を変更したら、マイグレーションを作成してからローカル D1 に適用してください。

`PAYLOAD_MIGRATING` はテストなど内部処理でのみ使用します。通常の開発起動時に手動設定する必要はありません。

### CLI・MCP によるサイト操作

管理画面を開かずに記事などのコンテンツを操作する場合は `intacms` CLI を使います。AI エージェントからは同じユースケースを MCP Tool として実行できます。認証、環境の切り替え、CRUD コマンド、MCP の設定方法は [[features/site-tools|CLI・MCP によるサイト操作]] を参照してください。

### 型の再生成

コレクションやグローバルのフィールドを変更したあとは必ず型を再生成します。

```bash
vp run generate:types
```

これにより以下のファイルが更新されます。

- `src/payload-types.ts` — Payload の自動生成型定義
- `cloudflare-env.d.ts` — Cloudflare バインディングの型定義

どちらのファイルも手動で編集してはいけません。

`src/app/(payload)/admin/importMap.js` も同じく Payload の生成物です。開発サーバーの起動時と `vp run generate:importmap` で上書きされるため、手動で編集せず、生成結果をそのままコミットします。フォーマッターと lint の対象からも外しています。

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
vp run payload migrate:create <name>
vp run payload migrate
```

- 型を再生成する

```bash
vp run generate:types
```

ライブプレビュー対象にするには `src/payload.config.ts` の `livePreviewCollections` 配列に slug を追加します。フロントエンドに対応するルート (`/news/[slug]` 等) が存在することが前提です。

```typescript
export default buildCoreConfig({
  dirname,
  features: projectFeatures,
  projectGlobals: [homeGlobal],
  livePreviewCollections: ["news", "tours"], // 追加した slug を列挙
  livePreviewGlobals: ["home-page"],
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
  livePreviewGlobals: ["home-page", "access-page"], // ライブプレビュー対象にする場合
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

変更後、マイグレーションを作成して適用し、`vp run generate:types` で型を再生成します。SEO プラグインは `enableFreePages` が true のとき自動的に `pages` を対象に含めるため、追加設定は不要です (`config-base.ts` がフラグに応じて切り替えます)。

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
      DEFAULT: "#1a5f7a",
      light: "#3a7a94",
      dark: "#0f4558",
    },
    accent: {
      DEFAULT: "#ff6b35",
    },
  },
  fontFamily: {
    sans: ['"Noto Sans JP"', "Hiragino Sans", "sans-serif"],
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

Cloudflare Workers Free プランでは Worker の圧縮後サイズ上限が 3 MiB、Paid プランでは 10 MiB です。デプロイ前にバンドルサイズと想定利用量を確認し、上限に合うプランを選択してください。最新の条件は [Workers Pricing](https://developers.cloudflare.com/workers/platform/pricing/) と [OpenNext の Worker Size Limits](https://opennext.js.org/cloudflare#note-on-worker-size-limits) を参照してください。

デプロイ系タスクは `Makefile` に集約しています。

```bash
make deploy            # DB マイグレーション + アプリデプロイ (CLOUDFLARE_ENV のデフォルトは production)
make deploy-app        # アプリのみ (マイグレーション済みの場合)
make deploy-db         # DB マイグレーションのみ
make deploy-preflight  # Cloudflare のデプロイ設定のみ検査
make preview           # トップレベルのローカル専用 D1 / R2 でプレビュー
```

`make deploy-db` は内部で以下を実行します。

- `payload migrate` をリモート D1 に対して適用
- `wrangler d1 execute D1 --command 'PRAGMA optimize'` でクエリプランを最適化

`make deploy*` は最初に preflight を実行し、未設定、雛形値、命名の不一致、環境間でのリソース共有を検出すると停止します。
`wrangler.jsonc` の以下を対象環境の値に更新してください。

- `env.production.name` — 本番 Worker 名 (`<slug>`)
- `env.production.account_id` — 配置先 Cloudflare Account ID
- `env.production.d1_databases[0]` — `<slug>-cms` の名前、database_id、`remote: true`
- `env.production.r2_buckets[0]` — `<slug>-cms` の名前、`remote: true`
- `ratelimits[].namespace_id` — 同じCloudflareアカウント内の他bindingと重複しない正の整数。トップレベルと`env.production`も別IDにする

トップレベルの Worker / D1 / R2 はローカル専用です。`env.production` と同じ名前やIDを設定しないでください。

### 環境変数

本番環境で設定が必要な環境変数は以下のとおりです。

- `PAYLOAD_SECRET` — 必須。`openssl rand -hex 32` で生成した 32 バイトのランダム文字列
- `NEXT_PUBLIC_SERVER_URL` — ライブプレビューの URL 解決に使用。デプロイ先の URL を設定
- `TURNSTILE_SECRET_KEY` — 問い合わせフォームのCloudflare Turnstile検証用。フォームを残す本番環境では必須 (サーバー側のみ。サイトキーは管理画面のサイト設定で入力する)
- `RESEND_API_KEY` / `CONTACT_NOTIFICATION_EMAIL` / `CONTACT_NOTIFICATION_FROM` — 問い合わせ通知メール (任意。3 つすべて設定で通知有効)
- `SUPPORT_EMAIL` — ダッシュボードのヘルプリンク用 (任意)
- `ANTHROPIC_API_KEY` / `OPENAI_API_KEY` — AI 翻訳で使用するプロバイダーの API キー (任意)
- `AI_TRANSLATION_MAX_*` — AI 翻訳の月間・実行単位の上限。管理画面と環境変数の小さい方を採用 (任意)
- `AI_TRANSLATION_ANTHROPIC_API_URL` / `AI_TRANSLATION_OPENAI_API_URL` — AI Gateway などへ接続先を差し替える場合に使用 (任意)
- `PAYLOAD_LOG_LEVEL` — Payload のログレベル。未設定時は `info` (任意)
- `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` — デプロイやバックアップ自動化を追加する場合に使用 (任意)

ローカル開発では `.env` ファイルに設定します。`TURNSTILE_SECRET_KEY` が未設定の場合、ローカル開発として Turnstile 検証がスキップされます。本番では必ず設定してください。

Turnstile の公開サイトキー (フロントエンド用) は環境変数ではなく、管理画面の「サイト設定」グローバルの `turnstileSiteKey` で設定します。サイトキーが設定されると問い合わせフォームが Turnstile ウィジェットを読み込みます。

公開フォームは匿名のPayload REST/GraphQL createを使用せず、Server Actionだけを入口にします。Server Actionは入力上限・問い合わせ種別・Cloudflare Rate Limiting・Turnstileを確認してからLocal APIで保存します。既定のレートは正規化したメールアドレスとサイト識別子のSHA-256ごとに5回/60秒で、生のメールアドレスやIPアドレスをカウンターキーやログへ渡しません。CloudflareのRate Limitingは拠点ごとの近似的な制御なので、Turnstileと組み合わせた二次防御です。設定は[Cloudflare Rate Limiting API](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/)を参照してください。

問い合わせ種別を案件用に変更するときは、`contact-form-constraints.ts`の`CONTACT_INQUIRY_TYPES`と、問い合わせページの表示ラベルを同時に更新してください。サーバーは定義外の値を保存しません。

### SSG モード (骨格)

`vp run setup:project` で `ssg` を選択すると SSG モードが適用されます。これは xserver 等 Node.js が動かない環境向けの静的書き出し用モードです。

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
vp run generate:types
vp run test:int
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

テンプレートには GitHub Actions ワークフローを同梱していません。案件ごとに `.github/workflows/` を追加し、少なくとも `vp check` と `vp test` を実行してください。D1 の定期バックアップを追加する場合は、リモート D1 のダンプと R2 への保存を別ジョブとして構成します。

デプロイやバックアップを自動化する場合は GitHub リポジトリの Settings > Secrets に以下を設定します。

- `PAYLOAD_SECRET` — Payload 用シークレット (統合テストは vitest.setup.ts のテスト専用フォールバックで動作する。本番は未設定だと起動失敗する)
- `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` — Cloudflare へのデプロイやバックアップ用

## トラブルシューティング

### ローカル D1 のマイグレーションでエラーになる

D1 アダプターは `push: false` のため、スキーマはマイグレーションだけで更新します。エラーが出た場合は開発サーバーを停止し、次の順で確認してください。

- `src/migrations/` の内容と `wrangler.jsonc` の D1 バインディングが対象環境に合っているか確認する
- 生成された SQL に既存テーブルやインデックスとの重複がないか確認する
- ローカル D1 に未適用のマイグレーションを適用する

```bash
vp run payload migrate
```

ローカルデータベースを作り直す場合は、必要なデータを先にバックアップし、その環境が破棄可能であることを確認してください。

### array フィールドのマイグレーションと autosave

`type: 'array'` フィールドを持つ Global/Collection でマイグレーションを手動作成する場合、version 用の array サブテーブルに `_uuid` カラムを含める必要があります。Payload は version の array 項目を `_uuid` で追跡しているため、このカラムが欠落すると autosave/publish 時に array データが version テーブルにコピーされず、admin 画面で入力が消える現象が発生します。

`migrate:create` がインタラクティブ入力を求めて失敗し、手動でマイグレーション SQL を書く場合は特に注意してください。適用後のローカル D1 とマイグレーションのテーブル定義が一致しているか、以下のコマンドで確認できます。

```bash
bunx wrangler d1 execute D1 --local --command="PRAGMA table_info(_<global>_v_version_<array_field>)"
```

生成されたマイグレーションをスキーマ更新の正として扱い、`_uuid` を含むテーブル定義をレビューしてからローカルで適用し、autosave と publish の動作を確認してください。

関連 Issue:

- [Autosave with SQLite interfering with publishing (payloadcms/payload#8659)](https://github.com/payloadcms/payload/issues/8659)
- [Migrations ドキュメント](https://payloadcms.com/docs/database/migrations) — マイグレーションの作成・適用方法

### マイグレーション作成時の注意

SQLite の二重引用符フォールバック問題に注意してください。生成されたマイグレーション SQL で `INSERT INTO ... SELECT` を使う場合、新規カラムに既存テーブルから値を SELECT すると文字列リテラルとして解釈される場合があります。

既存データがある状態でカラムのデフォルト値を設定する場合は、`'published'` や `NULL` などのリテラルを明示的に指定してください。マイグレーションファイル (`src/migrations/` 配下) を必ず内容確認してから `vp run payload migrate` を実行してください。

### ライブプレビューが表示されない

以下を確認してください。

- `livePreviewCollections` / `livePreviewGlobals` に対象の slug が含まれているか
- フロントエンドに対応するルートが存在するか (例: `src/app/(frontend)/news/[slug]/page.tsx`)
- 管理画面に管理者でログイン済みか (`/next/preview` は Payload 認証を通す)
- `NEXT_PUBLIC_SERVER_URL` が正しい URL を指しているか

### 問い合わせフォームが動かない

`TURNSTILE_SECRET_KEY` が未設定のとき、検証をスキップするのはローカル開発だけです。本番では設定エラーとして保存せず、画面には再試行可能なエラーを表示します。フォームが送信できない場合は以下を確認してください。

- 本番環境で `TURNSTILE_SECRET_KEY` (env) が設定されているか
- 管理画面のサイト設定 (site-settings) で Turnstile サイトキーが入力されているか
- Turnstile のサイトキーがドメインに紐づいているか (Cloudflare ダッシュボードで確認)
- `wrangler.jsonc` の使用環境に `CONTACT_RATE_LIMITER` bindingがあり、`namespace_id`がアカウント内で一意か

### vp run build が失敗する

メモリ不足が原因の場合は `build` スクリプトに `--max-old-space-size=8000` が付いているため、ホストに 8GB 以上のメモリが必要です。

型エラーが原因の場合は `vp run generate:types` を実行してから再ビルドしてください。
