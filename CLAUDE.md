# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Payload CMS 3 + Next.js 16 (App Router) + Cloudflare (D1/R2/Workers) で構築する Inta CMS テンプレート。Cloudflare Workers 専用（Vercel 等には未対応）。管理画面は日本語ローカライズ済み。

## 技術スタック

- CMS: Payload CMS 3.88 (`@payloadcms/db-d1-sqlite`)。バージョンは `package.json` が正本
- フレームワーク: Next.js 16 (App Router) / React 19 / TypeScript 5.7 (`strict: true`)
- データベース: Cloudflare D1 (SQLite)、ストレージ: Cloudflare R2
- デプロイ: Cloudflare Workers (`@opennextjs/cloudflare`)
- リッチテキスト: Lexical Editor (`@payloadcms/richtext-lexical`)
- ランタイム: Node.js `^22.18.0 || >=24.11.0`（`package.json` の `engines` と `.node-version` が正本。Next 16 / Vite+ / wrangler の要求範囲の共通部分）
- ツールチェーン: Vite+（依存管理・スクリプト・lint・format・test）/ Bun 1.3+（管理対象ランタイム）
- リンター & フォーマッター: vite-plus (`vp lint` / `vp check`)。設定は `vite.config.ts` に最小限のみ
- 統合テスト: vite-plus test (vitest 互換) + @testing-library/react (`tests/int/`)。コンポーネントテストはファイル先頭の `@vitest-environment jsdom` で DOM を有効化
- E2E テスト: Playwright / Chromium (`tests/e2e/`)。ローカル D1 が並列に弱いため workers は 1 固定。開発用の `.wrangler/state` とは別に `.wrangler/state-e2e` を毎回作り直し、fixture (`tests/helpers/e2e-fixtures.ts`) を投入してから実行する
- UI カタログ: Storybook 10 (`@storybook/react-vite`) / `.storybook/`。`vp run test:storybook` が全 story の描画と axe による a11y (serious 以上) を検査する

## ディレクトリ構成の要点

```
src/
  payload.config.ts           Payload CMS 設定 (D1 / R2 / i18n / プラグイン)
  payload-types.ts            Payload 自動生成型定義 (手編集禁止)
  core/                       テンプレ本体。読み取り専用、改変は本体リポジトリへ PR
    collections/              users / media / news / faq / contact-submissions / pages / ai-translation-logs
    globals/                  site-settings (サイト設定) / ai-translation-settings (AI翻訳設定)
    payload/config-base.ts    buildCoreConfig（案件側 payload.config.ts から呼ばれる）
    sections/                 汎用セクション (hero / featured-news / rich-text / cta)
    frontend/                 共通フロントエンド資産 (components/RefreshRouteOnSave, forms/問い合わせフォーム)
    lib/                      media/ (画像URL解決) / lexical (RichText) / revalidate/ / format-news-date / build-metadata / load-site-settings / access/ / email/
    test-support/             Storybook・テスト用の型付きサンプルデータ (本番バンドルには含まれない)
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
      sections/               site-header / site-footer / page-header など
      components/             汎用 UI コンポーネント (フラット配置)
      ui/                     shadcn/ui 所管領域
      hooks/ / lib/           汎用フック / util
    collections/              案件固有コレクション (works など。news/faq は core 側)
    admin/                    管理画面カスタム (ダッシュボードタスク等)
  app/(frontend)/[locale]/    フロントエンドページ (ルート / about / service / works / news / faq / contact / 404)。汎用ページ [slug] は enableFreePages 有効時に案件側で追加
  app/(payload)/              Payload の管理画面 / REST / GraphQL
  app/sitemap.ts, robots.ts   サイトマップと robots.txt (公開済みコンテンツから動的生成)
.storybook/                   Storybook 設定 (main.ts / preview.tsx)
tests/int/                    統合テスト (vitest)
tests/e2e/                    E2E テスト (Playwright)
```

Storybook ストーリーは対象コンポーネントと同じディレクトリに `<name>.stories.tsx` としてコロケーションする（例: `src/project/shared/ui/button.stories.tsx`）。ストーリー生成は `/add-story` スキルを使う。

コロケーションの運用ルール:

- `pages/<page>/sections` は外から直接 import しない（そのページのみが使う）
- `pages/<page>/components` も同様。他ページで使いたくなったら `shared/components/` に昇格（移動）
- `shared/components/` はフラット配置。サブフォルダで分類しない（20 ファイル超えたら再検討）
- `shared/ui/` は shadcn/ui 所管。手動でファイル追加しない。中身はテーマトークンに合わせて手編集 OK
- 最大階層は 3（`pages/home/sections/hero-section.tsx`）。4 階層以上は作らない

## 開発コマンド

```bash
vp run dev                          # 開発サーバー (http://localhost:3000)
vp run devsafe                      # .next / .open-next を消してから dev 起動
vp run build                        # プロダクションビルド
vp run start                        # プロダクションサーバー
make preview                        # Cloudflare Workers ローカルプレビュー
vp lint                             # lint
vp fmt                              # format
vp test                             # Vite+ のテスト
vp check                            # format + lint + 型チェック
vp run test                         # 統合テスト + Playwright すべて
vp run test:int                     # 統合テストのみ
vp run test:e2e                     # E2E テストのみ
vp run generate:types               # Cloudflare + Payload 型を生成
vp run generate:importmap           # Payload Import Map 生成
vp run payload migrate              # DB マイグレーション
vp run seed                         # サンプルデータ投入 (ローカル D1)
vp run storybook                    # Storybook 起動 (http://localhost:6006)
vp run build-storybook              # Storybook 静的ビルド (storybook-static/)
```

## デプロイ

Cloudflare Workers (Paid プランが必要)。デプロイ系タスクは `Makefile` に集約している (環境変数を素のシェルで渡すため)。

```bash
make deploy           # DB マイグレーション + アプリ (CLOUDFLARE_ENV のデフォルトは production)
make deploy-app       # アプリのみ
make deploy-db        # DB マイグレーションのみ
```

`CLOUDFLARE_ENV` を上書きすれば別環境にデプロイできる (例: `make deploy CLOUDFLARE_ENV=staging`)。`wrangler.jsonc` には `env.staging` の雛形があり、D1 / R2 を作成して `database_id` を埋めれば使える。

`make deploy*` の前段の `deploy-preflight` は、Worker / D1 / R2 / Account ID の設定に加えて、対象環境に必須シークレット (`PAYLOAD_SECRET`) が登録されているかも検査する (任意シークレットは警告のみ)。

`wrangler.jsonc` で D1 (binding: `D1`) と R2 (binding: `R2`) を定義している。`database_id` と R2 の `bucket_name` は各自のリソースに合わせて更新する必要がある。

本番環境では `.env` を使わない。Cloudflare Secret Store に登録する:

```bash
wrangler secret put PAYLOAD_SECRET --env=production
# 任意: 利用する場合のみ
wrangler secret put TURNSTILE_SECRET_KEY --env=production
wrangler secret put RESEND_API_KEY --env=production
wrangler secret put EMAIL_FROM --env=production
wrangler secret put CONTACT_NOTIFICATION_EMAIL --env=production
# 任意: 通知メールだけ別の送信元にする場合のみ
wrangler secret put CONTACT_NOTIFICATION_FROM --env=production
# 任意: AI翻訳を使う場合のみ（選択モデルのプロバイダ分だけ）
wrangler secret put ANTHROPIC_API_KEY --env=production
wrangler secret put OPENAI_API_KEY --env=production
```

staging 環境は `--env=staging` に置き換えて各シークレットを登録する。

## 設計上の非自明ポイント

- `src/core/payload/config-base.ts` の Cloudflare コンテキストは、OpenNext が注入済みなら `getCloudflareContext`、それ以外は `getPlatformProxy` を使う。Next dev は `next.config.ts` でローカル binding を注入する。CLI は環境変数 `CLOUDFLARE_REMOTE_BINDINGS=true` を明示したときだけ `remoteBindings: true`（`make deploy-db` が設定する）。`NODE_ENV=production` だけでは remote にならず、dev・テスト・ビルド時の fallback はローカル binding を使う。
- wrangler.jsonc の D1 binding に `remote: true` があっても、`vp run build` の SSG プリレンダーはリモート D1 に接続しない。ビルドは Cloudflare アカウントや本番 DB の状態に依存せず、ローカル D1 (`.wrangler/state/v3`) を使う。デプロイ済み Worker は実行環境から渡された D1 / R2 binding を使い、`CLOUDFLARE_REMOTE_BINDINGS=true` を付けた Payload CLI だけがリモート binding を使う。
- 案件固有の Global は `src/project/pages/<page>/global.ts` に置き、`src/payload.config.ts` の `projectGlobals` に import 追加する。export 名は `<name>Global`（例 `homeGlobal`）。
- 案件固有のコレクションは `src/project/collections/*.ts` に置き、`projectCollections` に追加する。
- `src/payload-types.ts` は `vp run generate:types` で再生成する。手で書き換えない。
- Sharp は Cloudflare Workers 上で動かないため、画像の `crop` / `focalPoint` は本番で無効。ローカル dev では動く。
- メディアファイルは R2 (`media` コレクション) 経由でのみ扱う。ローカルファイルシステムには置かない。
- Payload 管理画面 / フロントエンドは `app/(payload)` と `app/(frontend)` のルートグループで分離されている。
- リンターは ESLint ではなく vite-plus (`vp lint` / oxlint ベース) を使う。Turbopack デフォルトの仕様で webpack 設定が必要な dev/build には `--webpack` を付けて回避している。
- ユーザーは `admin` / `editor` / `serviceAdmin` のロールを持つ。コレクションの削除など破壊的操作は admin のみ可能。`serviceAdmin` はサービス提供側（実装会社）専用で、AI翻訳設定の閲覧・変更に使う。serviceAdmin の付け外しは serviceAdmin 自身のみ可能（クライアント admin の自己昇格を hook で防止）。初回セットアップ時に実装会社のアカウントへ付与しておくこと。共通アクセス制御は `src/core/lib/access/` 配下を参照。
- メール送信は Payload 公式の Resend アダプタ (`src/core/lib/email/resolve-email-adapter.ts`) が唯一の経路。パスワード再設定などの認証メールと問い合わせ通知が同じ経路を通る。`RESEND_API_KEY` と送信元 (`EMAIL_FROM`、無ければ `CONTACT_NOTIFICATION_FROM`) が揃わなければアダプタを渡さず、Payload 既定の console アダプタ（宛先と件名だけをログ出力）にフォールバックする。
- 問い合わせ通知は `src/core/lib/email/deliver-contact-notification.ts` に集約している。送信結果を `contact-submissions` の `notificationStatus` / `notificationError` / `notifiedAt` に記録し、失敗してもフォーム保存はブロックしない。フォーム送信時は失敗すると 1 秒後に 1 回だけ再試行する。管理画面の編集画面にある「通知を再送」ボタン（`POST /api/contact-submissions/:id/resend-notification`、admin / serviceAdmin のみ）も同じ関数を通し、`notificationStatus` が `sent` のレコードは再送しない。ログへ出す文字列は `sanitizeErrorMessage` を通してメールアドレスを伏せる。
- ニュース / ページ更新後は `src/core/lib/revalidate/build-collection-revalidate-after-change.ts` などの hook ビルダー経由で対象パスを `revalidatePath()` する (削除側は `build-collection-revalidate-after-delete.ts`、グローバルは `build-global-revalidate-after-change.ts`)。案件側で新コレクションを追加した場合も同 hook を使うこと。
- テーマトークン（色・フォント・余白・コンテナ幅）の正本は `src/app/(frontend)/[locale]/styles.css` の `@theme inline` と `:root` / `.dark`。案件のブランド色を変える場合はここを編集する。

## AI翻訳機能

多言語入力（Payload Localization）と AI 翻訳は別機能。AI 翻訳を止めても手動の多言語入力と保存済み翻訳はそのまま残る。実装は `src/core/lib/ai-translation/`、管理画面 UI は `src/core/admin/ai-translation/`。

- 出し分けは二段構え。コード側は `src/project/project-features.ts` の `enableAiTranslation`（false なら設定 Global・監査ログ・エンドポイント・ボタンごと消える）、運用側は管理画面「AI翻訳設定」の `enabled` チェックボックス（オフで即停止）。月額課金の停止・再開は `enabled` で行う。
- 画面の見せ方はロールで分離している。「AI翻訳設定」（enabled・モデル・上限・費用込みの利用状況）は `serviceAdmin` のみ閲覧・変更可。「AI翻訳ログ」はクライアントの admin も閲覧でき、一覧上部に当月の利用状況パネル（実行回数・文字数のみ、費用なし）を表示する。ログの `estimatedCostUsd` フィールドは field access で serviceAdmin のみ読める。
- 対応言語は `buildCoreConfig` の `locales` prop で変更する（デフォルトは ja / en）。配列の先頭がデフォルト言語 = AI 翻訳の翻訳元になる。単一言語運用は `locales: [{ code: 'ja', label: '日本語' }]` を渡し、`src/project/shared/lib/locale-types.ts` の `locales` も合わせる。
- 翻訳対象は「`localized: true` の text / textarea / richText」を再帰抽出する共通ルール。新しいセクションやコレクションを追加しても、localized を付ければ自動で翻訳対象になり個別実装は不要。多言語入力はさせたいが AI 翻訳はさせたくないフィールドは `custom: { aiTranslate: false }` を付ける。
- array / blocks / group 自体への `localized: true` は AI 翻訳非対応（抽出をスキップ）。テンプレートの規約どおりフィールド単位の localized を使うこと。
- モデルは管理画面の select（`src/core/lib/ai-translation/translation-models.ts` のレジストリ）から admin が選ぶ。gpt / claude の切り替えはここ。モデル追加はレジストリに 1 エントリ足すだけ。API キーは DB に保存せず環境変数 `ANTHROPIC_API_KEY` / `OPENAI_API_KEY` のみ（ローカルは `.env`、本番は wrangler secret）。
- 利用上限（月間実行回数・文字数・推定費用・1回あたり文字数・クールダウン）は「AI翻訳設定」で管理し、上限到達時は AI API を呼ぶ前に拒否する。費用上限は実績と今回実行分の見込み費用を合算して判定する。集計は `ai-translation-logs`（監査ログ、admin / serviceAdmin が閲覧・サーバー内部のみ作成）を日本時間の月初から集計し、API を呼んだ後に失敗した run の実費も含める（rejected は含めない）。同時実行で上限を超えないよう、判定より先に `pending` の予約行を入れ、集計では「自分の予約 id より前の予約」だけを数える（順序付き予約。詳細は `.docs/decisions/005-ai-translation-ordered-reservation.md`）。異常終了して確定しなかった予約は 10 分で失効し、費用を見込み額のまま `failed` へ回収する。クールダウンは同一ユーザー・同一ドキュメント・同一言語の連続実行だけを制限する（複数言語の順次翻訳を妨げない）。
- 上限には実装側だけが触れる「天井」を環境変数で設定できる: `AI_TRANSLATION_MAX_MONTHLY_RUNS` / `AI_TRANSLATION_MAX_MONTHLY_CHARACTERS` / `AI_TRANSLATION_MAX_MONTHLY_COST_USD` / `AI_TRANSLATION_MAX_PER_RUN_CHARACTERS`。管理画面の設定値と env の小さい方が有効になるため、クライアント admin が管理画面で上限を引き上げても天井を超えられない。管理画面の利用状況パネルにも天井適用後の実効値が表示される。
- API の接続先は `AI_TRANSLATION_ANTHROPIC_API_URL` / `AI_TRANSLATION_OPENAI_API_URL` で差し替えられる（未設定なら公式 API 直）。Cloudflare AI Gateway を挟む場合はゲートウェイのエンドポイント（例: `https://gateway.ai.cloudflare.com/v1/<account>/<gateway>/anthropic/v1/messages`）を指定すると、複数サイトの利用量集計・レート制限・一括停止を Cloudflare ダッシュボード側で管理できる。
- サイト運用を他社へ移管するときのチェックリスト: 1. プロバイダのコンソールで該当サイト用の API キーを失効させる（キーはサイトごとに個別発行しておく） 2. 移管先が自前のキーを wrangler secret に登録する 3. AI Gateway 経由の場合はゲートウェイ側の設定・トークンも無効化する。キーは env にしか存在しないため、失効すれば管理画面の状態に関わらず確実に止まる。
- エンドポイント `POST /api/ai-translate` は対象ドキュメントの参照と翻訳先言語だけを受け付ける。原稿はサーバー側で CMS から取得し、プロンプト・モデル名・フィールド指定などの自由入力は受け付けない（チャット用途への流用防止）。応答は件数・型・長さを検証してから保存し、想定外の出力は保存しない。
- 既存翻訳は上書きしないのがデフォルト（未入力フィールドのみ翻訳）。上書きは管理画面の「再翻訳（上書き）」から確認ダイアログ付きで実行する。versions.drafts のあるエンティティへの翻訳保存は draft 扱いで、編集者の確認後に公開する。

## 生成 AI のガードレール

- `src/core/` は読み取り専用。改変したい場合は本体テンプレートリポジトリへ PR を送る
- 新規ファイル作成は原則 `src/project/` 配下に限定する（例外は route `src/app/(frontend)/[locale]/**`、`src/payload.config.ts`、`src/migrations/**`、`wrangler.jsonc`。一覧は `.docs/architecture.md` の「コード所有境界」）
- 新規コレクション追加時は `src/payload.config.ts` の `projectCollections` への追加を忘れない
- セクションは Payload の `group` フィールドで作り、`enabled` チェックボックスを必ず含める
- フィールドラベルは日本語、フィールド名は lowerCamelCase
- hex 直書き禁止。色・余白・コンテナ幅は `styles.css` の `@theme` / `:root` で定義したトークン（`bg-primary`、`py-section`、`max-w-content` など）を使う
- slug / URL / 電話番号 / 文字数の制約は `src/core/lib/validation/` の共有 validator と `text-limits.ts` を使う（独自の正規表現をフィールドに直書きしない）
- 生成後は必ず `vp lint` と `vp run generate:types` を流す
- 案件の Single Source of Truth は `.docs/project-brief.md`。ここを先に読み込んでから作業する（テンプレート直後は未生成。`vp run setup:project` が `.docs/project-brief.template.md` から生成する）

## 参照

- @package.json
- @wrangler.jsonc
- @portless.json
