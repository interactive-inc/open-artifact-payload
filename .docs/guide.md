# Inta CMS テンプレート 運用ガイド

## はじめに

このガイドは Inta CMS テンプレートを使ってクライアント向けサイトを構築・運用する開発チーム向けのリファレンスです。テンプレートの目的、セットアップ手順、日常の開発フロー、コンテンツモデルの拡張方法、デプロイ手順、トラブルシューティングを網羅しています。

技術スタックの概要は以下のとおりです。

- CMS: Payload CMS 3.88.0 (`@payloadcms/db-d1-sqlite`)。バージョンは `package.json` が正本
- フレームワーク: Next.js 16.3.0 (App Router)
- データベース: Cloudflare D1 (SQLite)
- ストレージ: Cloudflare R2
- デプロイ: Cloudflare Workers (`@opennextjs/cloudflare`)
- 言語: TypeScript 5.7.3 (`strict: true`)
- ツールチェーン: Vite+ 0.2.8
- ランタイム / パッケージマネージャー: Bun 1.3.14

## セットアップ

### 前提条件

以下のツールを事前にインストールしてください。

- Node.js 22.18 以上の 22 系、または 24.11 以上（`.node-version` は 24 を指定。`package.json` の `engines` が正本）
- Bun 1.3 以上（`package.json` の `packageManager` に固定）
- Vite+ (`vp` コマンド)
- Cloudflare アカウント (Free / Paid は Worker サイズと利用量に応じて選択)

### テンプレートからプロジェクトを作成

テンプレートの更新を後から取り込めるよう、GitHub の "Use this template" ではなく clone で作成し、テンプレートを `upstream` remote として残すことを推奨します。

```bash
git clone <テンプレートリポジトリURL> <案件名>
cd <案件名>
git remote rename origin upstream
git remote add origin <案件リポジトリURL>
git push -u origin main
```

"Use this template" で作成した場合はテンプレートと履歴を共有しないため、テンプレート更新の初回取り込みの前に履歴の接ぎ木が必要になります（「テンプレート更新の取り込み」節を参照）。

依存関係をインストールします。

```bash
vp install
```

続いてセットアップスクリプトを実行します。スクリプトは対話形式で以下の質問に答えながら進みます。

```bash
vp run setup:project
```

質問の内容は以下のとおりです。

- 案件 slug (英小文字とハイフン、例: `my-client-2024`)
- Cloudflare Account ID
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

- クライアント名、業種、目的、納品先 (Cloudflare Workers の Worker 名やドメイン)
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
vp run test:ci                       # check + 統合テスト + packages + Cloudflare 設定 + 脆弱性監査 (CI の check job と同じ)

vp run generate:types                # Payload 型定義 + Cloudflare 型を再生成
vp run generate:importmap            # Payload Import Map 生成

vp run payload migrate               # ローカル D1 にマイグレーション適用
vp run payload migrate:create <name> # 新規マイグレーションファイル作成

vp run audit:content                 # 保存済みコンテンツを入力制約で検査 (読み取り専用)
```

### ローカル D1 のスキーマ管理

D1 アダプターは `push: false` で構成されており、開発環境でもスキーマ変更はマイグレーションで管理します。コレクションやグローバルの定義を変更したら、マイグレーションを作成してからローカル D1 に適用してください。

`PAYLOAD_MIGRATING` はテストなど内部処理でのみ使用します。通常の開発起動時に手動設定する必要はありません。

### worktree での並行開発

Issue ごとに作業ツリーを分ける場合は、リポジトリ直下の `.worktrees/` に linked worktree を作成し、`make worktree` で初期化します。

```bash
git worktree add -b 42-fix-pagination-offset .worktrees/42-fix-pagination-offset origin/main
cd .worktrees/42-fix-pagination-offset
make worktree
```

`make worktree` は依存関係の導入 (`vp install --frozen-lockfile`)、`.env` の用意、ローカル D1 へのマイグレーション適用をまとめて行います。`.env` は primary checkout に存在すればコピーし、無ければ `.env.example` を元に `PAYLOAD_SECRET` を生成します。ローカル D1 (`.wrangler/state/`) は worktree ごとに独立しているため、他の作業ツリーのデータは引き継がれません。サンプルデータが必要な場合は `vp run seed` を実行してください。

作業が終わった worktree は primary checkout から削除します。

```bash
git worktree remove .worktrees/42-fix-pagination-offset
```

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

`cloudflare-env.d.ts` は `wrangler.jsonc` の binding と `.env.example` の変数名から生成します。環境変数を増やすときは `.env.example` にも名前を追加してから再生成してください。フォーマッターと lint の対象外にしてあるので、生成された内容をそのままコミットします。

生成は誰がいつ実行しても同じ結果になるようにしてあります。手元の `.env` は読まず、`.env.example` だけを見ます。また `src/core/scripts/generate-cloudflare-types.ts` が `main` を外した一時設定を作って wrangler に渡すため、`.open-next` のビルド成果物があってもなくても出力は変わりません。

生成が最新かどうかは `vp run test:cloudflare-config` が検査します。

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

フィールドを定義するときは、入力制約を `src/core/lib/validation/` の共有 validator で付けます。独自の正規表現をフィールドに直書きしないでください。

- スラッグ (URL パス) — `validate: validateSlug`。汎用ページ (`pages`) だけは予約語も弾く `validatePageSlug`
- ナビゲーションや CTA のリンク — `validate: validateLinkHref`。内部パス、ページ内リンク、https、mailto、tel だけを通す
- SNS など外部サイトの URL — `validate: validateHttpsUrl`
- 電話番号 (TEL / FAX) — `validate: validatePhone`
- text と textarea の文字数 — `text-limits.ts` の `SHORT_TEXT_MAX_LENGTH` (見出しやラベル) と `LONG_TEXT_MAX_LENGTH` (説明文) を `maxLength` に指定

制約を追加または変更したあとは、既存データが新しい制約に違反していないかを確認します。

```bash
vp run audit:content
```

読み取り専用のコマンドで、違反があると `collection/global, id, locale, field, reason` の形式で一覧して終了コード 1 を返します。値の直し方は内容によって変わるため、修復用のマイグレーションは用意していません。出力を見ながら管理画面で直してください。

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
- hex カラー直書き禁止、Tailwind のテーマトークンを使う (`bg-primary`, `text-accent` 等)
- フロントエンドの `page.tsx` でセクションを組み立てる

### 汎用ページ機能の有効化

`pages` コレクション (タイトル、スラッグ、リッチテキスト、SEO) を有効化する場合は `src/project/project-features.ts` を変更します。

```typescript
export const projectFeatures: ProjectFeatures = {
  enableFreePages: true,
}
```

変更後、マイグレーションを作成して適用し、`vp run generate:types` で型を再生成します。SEO プラグインは `enableFreePages` が true のとき自動的に `pages` を対象に含めるため、追加設定は不要です (`config-base.ts` がフラグに応じて切り替えます)。

フロントで固定ページを表示するには、対応する `src/app/(frontend)/[locale]/[slug]/page.tsx` ルートを案件側で追加してください (テンプレートには同梱していません。`enableFreePages` が false のときは `pages` コレクション型が生成されず、ルートを同梱すると型エラーになるため)。ルートは `payload.find({ collection: 'pages', where: { slug: { equals: params.slug } } })` で取得し、`RichText` で本文を、`generateMetadata` で `doc.meta` を描画します。実装例は `src/app/(frontend)/news/[slug]/page.tsx` を参考にしてください。

### メディアのアップロード制約

`media` コレクションは画像だけを受け付けます。許可する形式と容量は `src/core/lib/validation/media-limits.ts` にまとめています。

- 許可する形式 — JPEG、PNG、WebP、GIF、AVIF
- 1 ファイルあたりの上限 — 10 MB

SVG は既定で受け付けません。スクリプトを埋め込める形式のため、アップロード権限を持つ編集者が意図せず実行可能なファイルを公開してしまうリスクがあります。案件で SVG が必要な場合だけ `media-limits.ts` の `ALLOWED_MEDIA_MIME_TYPES` に `image/svg+xml` を追加し、あわせてアップロードできるユーザーの範囲を見直してください。

容量の上限は二か所で効きます。管理画面や REST API 経由のアップロードは `config-base.ts` の `upload.limits` が本文を読み切る前に打ち切り、Local API や MCP 経由の作成は `media` コレクションの `beforeValidate` が同じ上限で止めます。

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
- `src/app/(frontend)/[locale]/styles.css` の `@theme` / `:root` へのカラー・フォント設定反映
- `src/payload.config.ts` の更新

### プロジェクト概要の書き方

`.docs/project-brief.md` の各セクションの意味は以下のとおりです。

プロジェクト概要セクションには、クライアント名・業種・目的・納品先 (Cloudflare Workers の Worker 名やドメイン) を記入します。

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

テーマトークンの正本は `src/app/(frontend)/[locale]/styles.css` です。色は `:root` / `.dark` に CSS 変数 (oklch) として定義し、フォント・セクション余白・コンテナ幅は同ファイルの `@theme inline` ブロックで定義します。hex や oklch の値はこのファイルにのみ記述し、コンポーネント内では Tailwind クラスを使います。

```css
@theme inline {
  --font-sans: "Noto Sans JP", "Hiragino Sans", "Yu Gothic", sans-serif;
  --container-content: 75rem;
  --container-wide: 56rem;
  --spacing-section: 6rem;
  --spacing-section-sm: 3.5rem;
  --color-primary: var(--primary);
  --color-accent: var(--accent);
}

:root {
  --primary: oklch(0.18 0 0);
  --accent: oklch(0.96 0 0);
}
```

案件のブランド色を差し替える場合は `:root` (ダークモードは `.dark`) の `--primary` / `--accent` などの変数値のみ編集すれば、全コンポーネントに反映されます。これにより以下の Tailwind クラスが使用可能になります。

- `bg-primary` / `text-primary-foreground`
- `bg-accent` / `text-accent-foreground`
- `py-section` / `py-section-sm`
- `max-w-content` / `max-w-wide`
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

Payload CLI がリモート D1 に接続するのは、環境変数 `CLOUDFLARE_REMOTE_BINDINGS=true` を明示した場合だけです。`make deploy-db` はこの環境変数を設定して `payload migrate` を実行します。手動でリモート D1 に対して `payload migrate:status` などを実行する場合は、以下のように同じ 3 つの環境変数を付けてください。

```bash
CLOUDFLARE_ENV=production CLOUDFLARE_REMOTE_BINDINGS=true PAYLOAD_SECRET=ignore vp run payload migrate:status
```

`CLOUDFLARE_REMOTE_BINDINGS` は `.env` には書かないでください。書いてしまうと常にリモート binding が使われ、ローカル開発が本番 D1 を触ってしまいます。

`make deploy*` は最初に preflight を実行し、未設定、雛形値、命名の不一致、環境間でのリソース共有を検出すると停止します。
`wrangler.jsonc` の以下を対象環境の値に更新してください。

- `env.production.name` — 本番 Worker 名 (`<slug>`)
- `env.production.account_id` — 配置先 Cloudflare Account ID
- `env.production.d1_databases[0]` — `<slug>-cms` の名前、database_id、`remote: true`
- `env.production.r2_buckets[0]` — `<slug>-cms` の名前、`remote: true`
- `ratelimits[].namespace_id` — 同じCloudflareアカウント内の他bindingと重複しない正の整数。トップレベルと`env.production`も別IDにする

トップレベルの Worker / D1 / R2 はローカル専用です。`env.production` と同じ名前やIDを設定しないでください。

### 環境ごとの binding と secret の契約

wrangler は環境を指定すると binding を継承しません。`env.production` と `env.staging` の両方に同じ binding を明示してください。

- `D1` — Payload のデータベース。環境ごとに別の D1 を作成し、`database_id` と `remote: true` を設定する
- `R2` — メディアの保存先。環境ごとに別のバケットを作成する
- `ASSETS` — OpenNext が出力する静的アセット。`assets.binding` で定義する
- `CONTACT_RATE_LIMITER` — 問い合わせフォームのレート制限。`namespace_id` を環境ごとに別の整数にする

一方で `compatibility_date`、`compatibility_flags`、`observability` は継承されるキーです。トップレベルに書けば全環境へ効くため、環境ごとに重複して書きません。

secret は環境ごとに `wrangler secret put <NAME> --env=<environment>` で登録します。`make deploy-preflight` が必須 secret の登録漏れを検出し、任意 secret は警告のみ出します。

- `PAYLOAD_SECRET` — 必須
- `TURNSTILE_SECRET_KEY` — 問い合わせフォームを残す場合は必須
- `RESEND_API_KEY` / `CONTACT_NOTIFICATION_EMAIL` / `CONTACT_NOTIFICATION_FROM` — 問い合わせ通知メールを使う場合に登録する（API キーと宛先は必須）
- `ANTHROPIC_API_KEY` と `OPENAI_API_KEY` — AI 翻訳で使うプロバイダーの分だけ登録する
- `AI_TRANSLATION_MAX_MONTHLY_RUNS` などの `AI_TRANSLATION_` 系 — AI 翻訳の上限の天井を実装側で握る場合に登録する

`NEXT_PUBLIC_SERVER_URL` は secret ではありません。ビルド時に焼き込まれるため `.env` の値が使われます。デプロイ前に本番ドメインへ変更してください。

### compatibility_date の更新手順

`compatibility_date` は同梱している wrangler の workerd で検証できる範囲に留めます。日付を進めると、その間に既定化された compatibility flag が一括で有効になり、Payload や OpenNext の挙動が変わることがあります。

更新は次の順序で行います。

- Cloudflare の [compatibility flags 一覧](https://developers.cloudflare.com/workers/configuration/compatibility-flags/) で、現在の日付と新しい日付の間に既定化されるフラグを確認する
- `wrangler.jsonc` の `compatibility_date` を更新する
- `vp run generate:types` で `cloudflare-env.d.ts` のランタイム型を再生成する
- `make preview` を起動し、トップページ、下層ページ、`/admin`、`/api/users/me` が想定どおり応答することを確認する
- `vp run test:e2e` を実行する

問題が出たら、原因のフラグを個別に無効化するか、`compatibility_date` を問題の出ない日付まで下げます。個別の無効化は、フラグ一覧に併記されている打ち消し用の名前 (`disable_` や `no_` で始まる名前) を `compatibility_flags` に追加します。

### 環境変数

本番環境で設定が必要な環境変数は以下のとおりです。

- `PAYLOAD_SECRET` — 必須。`openssl rand -hex 32` で生成した 32 バイトのランダム文字列
- `NEXT_PUBLIC_SERVER_URL` — ライブプレビューの URL 解決に使用。デプロイ先の URL を設定
- `TURNSTILE_SECRET_KEY` — 問い合わせフォームのCloudflare Turnstile検証用。フォームを残す本番環境では必須 (サーバー側のみ。サイトキーは管理画面のサイト設定で入力する)
- `RESEND_API_KEY` — Resend の API キー。認証メールと問い合わせ通知メールの共通の送信基盤 (任意)
- `EMAIL_FROM` — 認証メールと通知メールの送信元。`Name <address@example.com>` 形式。未設定なら `CONTACT_NOTIFICATION_FROM` を使う (任意)
- `CONTACT_NOTIFICATION_EMAIL` / `CONTACT_NOTIFICATION_FROM` — 問い合わせ通知の宛先と送信元 (任意。通知には `RESEND_API_KEY` と宛先の両方が必要)
- `SUPPORT_EMAIL` — ダッシュボードのヘルプリンク用 (任意)
- `ANTHROPIC_API_KEY` / `OPENAI_API_KEY` — AI 翻訳で使用するプロバイダーの API キー (任意)
- `AI_TRANSLATION_MAX_*` — AI 翻訳の月間・実行単位の上限。管理画面と環境変数の小さい方を採用 (任意)
- `AI_TRANSLATION_ANTHROPIC_API_URL` / `AI_TRANSLATION_OPENAI_API_URL` — AI Gateway などへ接続先を差し替える場合に使用 (任意)
- `PAYLOAD_LOG_LEVEL` — Payload のログレベル。未設定時は `info` (任意)
- `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` — デプロイやバックアップ自動化を追加する場合に使用 (任意)

ローカル開発では `.env` ファイルに設定します。`TURNSTILE_SECRET_KEY` が未設定の場合、ローカル開発として Turnstile 検証がスキップされます。本番では必ず設定してください。

メール送信は環境ごとに運用を分けます。dev は `RESEND_API_KEY` を設定せず、Payload 既定の console アダプタで宛先と件名だけがログに出る状態にします。staging と production は Resend を使い、`RESEND_API_KEY` と `EMAIL_FROM` を wrangler secret へ登録します。`EMAIL_FROM` のドメインは事前に Resend 側でドメイン認証 (SPF / DKIM) を済ませてください。認証が無いと送信が拒否されます。パスワード再設定などの認証メールもこの経路を通るため、`RESEND_API_KEY` が未設定の環境では再設定メールは届かず、ログに送信を試みた記録が残るだけになります。

Turnstile の公開サイトキー (フロントエンド用) は環境変数ではなく、管理画面の「サイト設定」グローバルの `turnstileSiteKey` で設定します。サイトキーが設定されると問い合わせフォームが Turnstile ウィジェットを読み込みます。

公開フォームは匿名のPayload REST/GraphQL createを使用せず、Server Actionだけを入口にします。Server Actionは入力上限・問い合わせ種別・Cloudflare Rate Limiting・Turnstileを確認してからLocal APIで保存します。既定のレートは正規化したメールアドレスとサイト識別子のSHA-256ごとに5回/60秒で、生のメールアドレスやIPアドレスをカウンターキーやログへ渡しません。CloudflareのRate Limitingは拠点ごとの近似的な制御なので、Turnstileと組み合わせた二次防御です。設定は[Cloudflare Rate Limiting API](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/)を参照してください。

問い合わせ種別を案件用に変更するときは、`contact-form-constraints.ts`の`CONTACT_INQUIRY_TYPES`と、問い合わせページの表示ラベルを同時に更新してください。サーバーは定義外の値を保存しません。

### SSG モード

静的書き出し (SSG) モードは提供していません。このテンプレートは Cloudflare Workers 専用で、`vp run setup:project` にもデプロイモードの選択肢はありません。Node.js が動かないホスティングへ静的配信したい案件は、管理画面のホスト先・問い合わせフォームの代替・静的生成と配布の仕組みを含めて別途設計が必要です。

## テンプレート更新の取り込み

テンプレートの修正は `src/core/` だけでなく、`src/migrations/`、`packages/`、ルート設定、依存関係、テスト、運用文書に及びます。そのため `src/core/` だけを部分的に取り込む方式は採らず、テンプレートの `main` を案件リポジトリへ Git でマージします。どのファイルがテンプレート所有・案件所有・共有編集かは [[architecture|アーキテクチャ]] の「コード所有境界」を、この方式を選んだ理由は [[decisions/004-template-update-by-upstream-merge|雛形更新の Git マージ配布]] を参照してください。

### 更新手順

```bash
git fetch upstream
git merge upstream/main
```

"Use this template" から作成して履歴を共有していない案件は、そのままマージすると全ファイルが競合します（`--allow-unrelated-histories` でも同じです）。初回だけ、案件の最初のコミットをテンプレートの元コミットへ接ぎ木してからマージします。元コミットは、案件の最初のコミットとツリーが一致するテンプレート側のコミットとして機械的に特定できます。

```bash
git remote add upstream <テンプレートリポジトリURL>
git fetch upstream main
INITIAL=$(git rev-list --max-parents=0 HEAD)
TEMPLATE_BASE=$(git log --format='%H %T' upstream/main | awk -v tree="$(git rev-parse "$INITIAL^{tree}")" '$2 == tree { print $1 }')
git rebase --root --onto "$TEMPLATE_BASE"
git merge upstream/main
```

`TEMPLATE_BASE` が空になる場合は、最初のコミットでファイルを編集しているため一致するコミットがありません。案件作成日のテンプレート `main` のコミットを指定してください。`rebase` は案件の履歴を書き換えるため、共同作業者がいる場合は事前に共有し、完了後に `git push --force-with-lease` します。2 回目以降は通常のマージです。

マージ後は次の順で整合を取ります。

```bash
vp install
vp run generate:types
vp run generate:importmap
vp run payload migrate
vp check
vp run test:int
```

### 競合の解決

競合したファイルは所有境界で判断します。

- テンプレート所有（`src/core/**` など）: upstream 側を採用します。案件側で変更していた場合は、その変更をテンプレートへ PR として送ります
- 案件所有（`src/project/**`、route、`wrangler.jsonc` など）: 案件側を維持します。テンプレートが契約モジュール（`@/project/...`）や設定項目を追加した場合は、その分だけ手で追加します
- 共有編集（`src/migrations/**`、`package.json`、`bun.lock`）: 両方を残します。マイグレーションはファイル名の timestamp 順に適用されるため、案件で作成済みのマイグレーションより古い timestamp のテンプレート側マイグレーションが来た場合は、ローカル D1 で `vp run payload migrate` を実行してスキーマ差分が無いことを確認します。`bun.lock` は `vp install` で再生成します

### 注意点

- `src/core/` 配下のファイルは案件側で直接変更しないでください。案件で変更すると、以後のマージで毎回競合します
- テンプレート更新にマイグレーションが含まれる場合、本番反映は通常のデプロイと同じく `make deploy-db` のあとに `make deploy-app` の順で行います
- `CHANGELOG.md` には管理画面の利用者や運用に影響する変更を記録しています。マージ前に `CHANGELOG.md` の差分を確認し、必要なら運用者へ案内してください

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

案件固有のコードは原則 `src/project/` 配下に置きます。ただし route (`src/app/(frontend)/[locale]/**`)、Payload の composition root (`src/payload.config.ts`)、案件由来のマイグレーション、`wrangler.jsonc` などは案件側で編集します。所有境界の一覧は [[architecture|アーキテクチャ]] の「コード所有境界」を参照してください。

- `src/project/pages/<page>/` — ページ単位のコロケーション (global.ts / sections/ / components/ / hooks/ / lib/)
- `src/project/shared/` — 複数ページで使う資産 (sections / components / ui / hooks / lib)
- `src/project/collections/` — 案件固有コレクション定義
- `src/project/admin/dashboard-tasks.ts` — ダッシュボードのクイックアクション一覧
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
- `tests/helpers/` — テスト用ヘルパー (E2E の準備 `prepare-e2e.ts`、fixture 定義 `e2e-fixtures.ts`、ログイン `login.ts`)
- `tests/storybook/` — Storybook の全 story を実ブラウザで開き、描画エラーと axe による a11y 違反 (serious 以上) を検査 (`vp run test:storybook`)

#### E2E の専用データ

E2E は開発用のローカル D1 / R2 (`.wrangler/state`) を使いません。Playwright の webServer が起動前に `tests/helpers/prepare-e2e.ts` を実行し、`.wrangler/state-e2e` を毎回削除してからマイグレーションと投入をやり直します。テストが途中で落ちても開発中のデータは汚れず、残った QA データも次の実行で消えます。保存先の切り替えは環境変数 `CLOUDFLARE_PERSIST_PATH` で行い、未設定なら wrangler 既定の `.wrangler/state/v3` を使います。

E2E が前提にするコンテンツは `tests/helpers/e2e-fixtures.ts` にまとまっています。公開と下書きのお知らせ・制作実績、FAQ、サイト設定、トップページと会社概要とサービスの各グローバルを投入します。テストはこの値を起点に一意な marker を書き込んで検証するため、実行後に値を元へ戻す処理はありません。

問い合わせフォームは Cloudflare Turnstile のテストキーで本番と同じ経路を通します。サイトキーは fixture のサイト設定に入り、シークレットは webServer の環境変数として渡されます。どちらも常に成功するテスト用のキーですが、ウィジェットの読み込みと siteverify で `challenges.cloudflare.com` へ接続するため、オフライン環境では `tests/e2e/contact-form.e2e.spec.ts` の送信テストが失敗します。

失敗したときは `playwright-report/` の HTML レポートと、失敗したテストにだけ残る trace を確認してください。webServer の標準出力もレポートに含まれます。

- `tests/helpers/` — テスト用ヘルパー (ユーザー作成 `seed-user.ts`、ログイン `login.ts`)
- `tests/storybook/` — Storybook の全 story を実ブラウザで開き、描画エラーと axe による a11y 違反 (serious 以上) を検査 (`vp run test:storybook`)

### GitHub Actions ワークフロー

テンプレートには `.github/workflows/ci.yml` を同梱しています。`pull_request` と `main` への `push` で起動し、以下の 3 job を並列実行します。同一 ref の実行は新しい push で自動キャンセルされます。

- `check` — `bun run check` (フォーマット・lint・型チェック)、`bun run generate:types:payload` 後に `src/payload-types.ts` の差分がないこと (型生成漏れの検出)、`bun run test:int`、`bun run test:tools`、`bun run test:cloudflare-config`、`bun audit --audit-level=high` を実行します
- `build` — `bun run build`、`bunx opennextjs-cloudflare build`、`bunx wrangler deploy --dry-run --strict --env=production` で本番相当ビルドとデプロイ設定を検証し、`bun run build-storybook` と `bun run test:storybook:static` を実行します
- `e2e` — Playwright (Chromium) で `bun run test:e2e` を実行します

いずれのジョブも Cloudflare へのログインや secret の登録は不要です。D1 / R2 はローカル binding、`wrangler deploy --dry-run` はデプロイ設定の静的検証のみで実際の Cloudflare API 呼び出しを行いません。GitHub リポジトリの Settings > Secrets に何も追加しなくてもそのまま動作します。

GitHub の branch protection では `check` / `build` / `e2e` の 3 つを必須ステータスチェックに設定してください。E2E が失敗した場合は `build` と `e2e` ジョブが失敗時にアップロードする `playwright-report` アーティファクト (7 日保持) を確認します。`e2e` ジョブは加えて `test-results` アーティファクトも保存します。

依存更新は `.github/dependabot.yml` で `npm` (weekly) と `github-actions` (weekly) を監視します。`npm` 側は互換性のある一群をまとめて 1 つの PR にグルーピングします (`payload`、`next-react`、`cloudflare`、`storybook`、`testing`、`vite-plus`)。特に Payload は `payload` 本体と `@payloadcms/*` パッケージ全体を同一 PR でまとめて上げ、バージョンがずれた状態で個別更新しないようにします。

D1 の定期バックアップを追加する場合は、`ci.yml` とは別に、リモート D1 のダンプと R2 への保存を行うワークフローを案件ごとに追加してください。その場合は GitHub リポジトリの Settings > Secrets に以下を設定します。

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
- フロントエンドに対応するルートが存在するか (例: `src/app/(frontend)/[locale]/news/[slug]/page.tsx`)
- 管理画面に管理者でログイン済みか (`/next/preview` は Payload 認証を通す)
- `NEXT_PUBLIC_SERVER_URL` が正しい URL を指しているか

### 問い合わせフォームが動かない

`TURNSTILE_SECRET_KEY` が未設定のとき、検証をスキップするのはローカル開発だけです。本番では設定エラーとして保存せず、画面には再試行可能なエラーを表示します。フォームが送信できない場合は以下を確認してください。

- 本番環境で `TURNSTILE_SECRET_KEY` (env) が設定されているか
- 管理画面のサイト設定 (site-settings) で Turnstile サイトキーが入力されているか
- Turnstile のサイトキーがドメインに紐づいているか (Cloudflare ダッシュボードで確認)
- `wrangler.jsonc` の使用環境に `CONTACT_RATE_LIMITER` bindingがあり、`namespace_id`がアカウント内で一意か

### vp run build で middleware 非推奨の警告が出る

`The "middleware" file convention is deprecated. Please use "proxy" instead.` は意図的に残している警告です。Next.js 16 の `proxy.ts` は Node.js runtime 専用で、OpenNext for Cloudflare 1.20 は `opennextjs-cloudflare build` を `Node.js middleware is not currently supported` で拒否します（2026-09 に実測）。`src/middleware.ts` を `proxy.ts` へ移行するのは、OpenNext が Node.js middleware に対応してからにしてください。移行時は locale rewrite と `x-locale` ヘッダーの E2E が通ることを確認します。

### 問い合わせ通知メールが届かない

問い合わせは保存が成功していれば管理画面の「問い合わせ一覧」に残ります。通知メールが届かない場合は、一覧の「通知状態」列で配信結果を確認してください。

- 送信済み — 通知は送れています。受信側の迷惑メール判定を確認してください
- 送信失敗 — 一時的な障害か送信設定の誤りです。編集画面を開いて「通知の失敗理由」を読み、原因を直してから画面上部の「通知を再送」を押します
- 送信スキップ — `RESEND_API_KEY`、`CONTACT_NOTIFICATION_EMAIL`、送信元（`EMAIL_FROM` または `CONTACT_NOTIFICATION_FROM`）のいずれかが未設定です。環境変数を設定してから「通知を再送」を押します
- 送信待ち — 送信処理の途中で中断しています。「通知を再送」で送り直せます

再送は admin とサービス管理者だけが実行できます。送信済みのレコードは押しても二重送信されません。

### パスワード再設定メールが届かない

認証メールは問い合わせ通知と同じ Resend 経由で送ります。`RESEND_API_KEY` と `EMAIL_FROM` (未設定なら `CONTACT_NOTIFICATION_FROM`) が揃っていない環境では送信されません。ローカル開発では未設定が既定のため、再設定リンクはメールでは届きません。届かない場合は以下を確認してください。

- 対象環境に `RESEND_API_KEY` が登録されているか
- `EMAIL_FROM` のドメインが Resend でドメイン認証済みか
- `NEXT_PUBLIC_SERVER_URL` が正しい URL を指しているか (再設定リンクの生成に使う)

### vp run build が失敗する

メモリ不足が原因の場合は `build` スクリプトに `--max-old-space-size=8000` が付いているため、ホストに 8GB 以上のメモリが必要です。

型エラーが原因の場合は `vp run generate:types` を実行してから再ビルドしてください。
