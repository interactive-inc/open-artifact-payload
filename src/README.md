# ソースコードの配置

公開画面はURLの近く、CMS・言語・SEO・運用処理はそれぞれの役割に置きます。包括的な `project` ディレクトリや互換用aliasは使いません。

## どこへ置くか

| 配置                                                                             | 所有するもの                                                               |
| -------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `app/(frontend)/[locale]/.../page.tsx`                                           | URLに対応するページ本文                                                    |
| 同routeの `_components` / `_sections` / `_styles` / `_data` / `_lib`             | そのページ専用の部品・セクション・CSS・固定JSON・表示補助                  |
| `app/(frontend)/` 直下の `_components` / `_sections` / `_ui` / `_hooks` / `_lib` | 複数routeで共有する公開表示。`_ui` はshadcnの出力先                        |
| `cms/globals` / `cms/collections` / `cms/admin`                                  | 案件のPayload定義・管理画面拡張                                            |
| `cms/project-features.ts` / `cms/types.ts` / `cms/mcp.ts`                        | CMS構成・機能フラグ・型・MCP公開操作                                       |
| `i18n`                                                                           | 言語の型・判定・URL接頭辞・表示辞書とカタログ                              |
| `seo`                                                                            | 既存のmetadata・言語別URLの補助                                            |
| `scripts`                                                                        | seed・データ確認など、通常リクエストと別に動く案件の運用処理               |
| `core`                                                                           | テンプレート共通基盤。案件では読み取り専用。本体開発では必要範囲を編集する |

トップページのhome-gridは `[locale]/_sections`、works一覧・詳細だけのラベルは `[locale]/works/_lib` に置きます。別routeのprivate folderから直接再利用せず、独立した共通表示になったときだけfrontend直下へ移します。Globalは一つのページ専用でも `cms/globals/<page>.ts` が所有します。

ページをそのまま返すだけの別入口やbarrelは作りません。必要な部品だけ切り出し、空のディレクトリを先に揃えません。`(frontend)` はURLに現れないroute group、先頭 `_` のフォルダはルーティング対象外です。Client Componentの境界は配置ではなく `"use client"` とimport関係で決まります。

CSS・表示用JSONも利用するrouteまたは共通部品の近くに置きます。テーマトークンの正本は `app/(frontend)/[locale]/styles.css` のままです。CMSフィールドは日本語ラベルとlowerCamelCaseの名前を使い、セクションgroupには `enabled` を含めます。

## 依存方向と問い合わせ

公開UIはCMS・言語・SEO・問い合わせを利用できます。CMSや業務処理から公開UIを参照しません。画面以外でも使う規則やDTOは、その業務の所有元に置きます。

雛形の問い合わせは `core/inquiry` が所有します。案件固有の拡張モジュールと区別します。

- `domain`: 入力DTO・長さ上限・制御文字などの既存検証、分類の固定コード
- `application`: 入力検証→メール由来rate key→頻度制限→Turnstile→保存→通知という受付順序と結果型。配信失敗時だけ1秒後に一度再試行する
- `infrastructure`: Payload保存、Cloudflare limiter、ハッシュ、Turnstile、環境値と待機。通知は既存の `core/inquiry/infrastructure/deliver-contact-notification.ts` に接続する
- `actions`: FormDataをDTOへ変換し、依存を組み立て、Server Actionの成功時に言語別thanksへ遷移する入口

`domain` は自分の純粋な値・規則だけ、`application` はdomainと注入された必要な操作だけに依存します。Payload・Next・Cloudflare・環境変数・外部I/Oは参照しません。SDK型をDTOへ持ち込まず、汎用Repository基底クラスやDIコンテナも導入しません。小さい機能に空の層を作らず、この構成を全機能へ機械的に適用しません。

問い合わせ種別は `core/inquiry/domain/contact-inquiry-type.ts` の6コードが正本です。`i18n/contact-inquiry-labels.ts` は `satisfies Record<Locale, Record<ContactInquiryType, string>>` で全言語・全コードの表示を型検査します。文言変更で保存コードを変えません。サーバー側の未選択許容、任意項目、保存形式、権限・通知再送は既存仕様のままです。

共通libに置くのは、業務知識なしで使える技術処理だけです。問い合わせ種別やCMSコレクションを知らずに使えるかで判断します。複数箇所で使うだけでは業務規則をlibへ移しません。問い合わせ専用の通知・再送・Payloadメールフィールド検証は `core/inquiry/infrastructure` に置き、認証メールと共通の送信アダプターやPII秘匿処理だけを `core/lib/email` に残します。`core/lib` から問い合わせ処理への依存も境界テストで拒否します。

## 設定・生成・テスト

`payload.config.ts` はCMS構成の入口です。`payload-types.ts`、`app/(payload)/admin/importMap.js`、ルートの `cloudflare-env.d.ts` は手編集せず `vp run generate:types` / `vp run generate:importmap` で生成します。`migrations` は案件・テンプレート由来を同じ時系列で管理します。

`setup:project` はCloudflare設定・ローカルenv・briefを準備します。旧ソースを生成・コピーする処理はなく、clone直後からこの配置です。生成AIの入力は `.docs/project-brief.md`、配置の正本はこの文書です。新しい案件を作る際も同じ規則を使います。

- unit: 実装隣の `src/**/*.test.ts(x)` と `tests/unit/**/*.test.ts(x)`。`vp run test:unit` はDB setupなし
- integration: `tests/int/**/*.int.spec.ts(x)` と既存 `packages/**/*.test.ts`。`vp run test:int` は使い捨てローカルD1/R2を毎回準備
- `vp test` は両project。packageの `test` はunit→integration→E2E、`test:ci` とGitHub Actionsも両projectを実行する。`test:tools` は手動の絞り込み用で、CIではintegrationと重ねて実行しない

Storybookは `src/core` / `src/app` / `src/cms` の隣接storyを探索し、ブラウザ検証で生成indexと全storyファイルを照合します。route groupの括弧をglobへ直書きせず、探索漏れを成功扱いにしません。

`tests/unit/source-boundaries.test.ts` がcoreの6契約、公開UIへの逆依存、route専用資産の利用範囲、純粋な層のSDK・環境参照、旧配置への参照を検査します。coreの明示的な契約と編集権限は [architecture](../.docs/architecture.md)、既存案件の移行と削除条件は [移行の決定](../.docs/decisions/007-source-layout-and-inquiry-boundaries.md) を参照してください。
