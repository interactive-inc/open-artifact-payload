# 公開UIの配置と雛形の問い合わせ境界

日付: 2026-09-09 / 状態: 採用

## 決定

`src/project` に混在していたコードを、公開UI・CMS・言語・SEO・運用処理の所有元へ移す。ページ本文はURLに対応するrouteへ置き、専用部品は同routeのprivate folder、共通表示はfrontend直下へ置く。Globalはページとの対応にかかわらず `src/cms/globals` が所有する。詳しい配置規約は [src/README.md](../../src/README.md) を正本とする。

HIRACTと案件側で評価されたコンテキスト所有、安定コードと表示カタログ、型による網羅性、外部接続の分離、隣接テストを取り入れる。巨大な階層や共通基盤は移植しない。業務知識を含む規則は共通libへ移さず、小さい機能に空の層を作らない。

本体テンプレート自身を更新するため、coreの6契約をCMS・i18nの正本へ直接変更する。互換facadeや個別aliasは残さない。`ProjectFeatures` / `projectFeatures` / `projectGlobals` などの設定契約名は維持する。

問い合わせは雛形の `core/inquiry` が所有する。domainは既存入力規則と6分類コード、applicationは検証・頻度制限・Turnstile・保存・通知の実行順序、infrastructureはSDK・環境・待機、actionsはFormData変換・接続の組み立て・redirectを担当する。必要な操作だけを引数で受け取り、Repository基底クラスやDIコンテナは作らない。分類は既存の文字列unionで十分であり、同一性のない値を形式的なVOクラスで包まない。

分類ラベルは `i18n/contact-inquiry-labels.ts` に既存のja/en文言を保ち、全言語・全分類を型検査する。制御文字、全項目の長さ上限、任意項目、サーバーの未選択許容、本番Turnstile必須、メールを秘匿したrate key、保存時の認可、各失敗結果、保存後通知、1秒後1回の再試行を維持する。管理画面からの再送は従来の通知関数と権限判定を使う。DB列・CMS slug・保存値・URL・本文・CSS・既存の表示順は変更しない。

Vitestはunitとintegrationの2 projects。unitは実装隣と `tests/unit`、integrationは従来の `tests/int` と `packages` を収集する。DB setupはintegrationのみ。旧依存方向テストと検証分岐テストはDB不要の場所へ移し、境界ガードと受付手順のケースを追加する。`vp test`、packageのtest/test:ci、GitHub Actionsで両projectが実行される。packagesとCloudflare設定のspecはintegrationで収集するため、CIで個別specを重複実行しない。

## 既存案件でのupstream merge

移動を含むため、案件が編集した旧ファイルにはrename/delete競合が起こり得る。案件の内容を失わないよう、内容を保って新配置へ移し、importと設定を同じ変更で更新する。coreだけを旧契約へ戻したり、TypeScriptのaliasで旧名を隠したりしない。

| 旧配置                                                                          | 新配置                                                                                        |
| ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `project/pages/<page>/global.ts`                                                | `cms/globals/<page>.ts`                                                                       |
| `project/pages/home/sections`                                                   | `app/(frontend)/[locale]/_sections`                                                           |
| `project/pages/<page>/components` / `sections` / `styles` / `data`              | 対応routeの `_components` / `_sections` / `_styles` / `_data`                                 |
| `project/shared/components` / `sections` / `ui` / `hooks`                       | `app/(frontend)/` 直下の対応private folder                                                    |
| `project/shared/lib`                                                            | 言語は `i18n`、metadataは `seo`、表示技術処理はfrontendの `_lib`。worksラベルはworksの `_lib` |
| `project/collections` / `admin` / `types.ts` / `mcp.ts` / `project-features.ts` | `cms` の対応ファイル                                                                          |
| `project/scripts`                                                               | `scripts`                                                                                     |
| `core/frontend/forms` の入力規則・送信・Turnstile                               | `core/inquiry` の対応責務（フォーム表示は元の場所）                                           |
| `core/lib/validation/validate-email.ts`                                         | `core/inquiry/infrastructure/validate-contact-email.ts`（問い合わせCollection専用）           |

案件側で6つのre-exportだけの互換ファイルを先行導入している場合も、更新後のcoreと全利用側が新しい6契約へ切り替わったことを確認する。互換ファイルに案件の実装が追加されていないかを読み、追加実装があれば先に所有元へ移す。

旧ディレクトリの削除条件:

1. 案件固有の本文・CSS・JSON・CMS定義・業務処理が新配置へ移っている
2. coreを含む全import、Payloadコンポーネント文字列、Storybook探索・preview、shadcn出力先、scripts、生成ガイドが新配置を参照している
3. `generate:types` / `generate:importmap` を再生成し、check、unit/integration、build、影響E2E・Storybookが通る
4. 旧契約への実参照と旧名を隠すaliasがなく、6契約のexportを新配置で維持している

この変更だけのDBマイグレーションは不要。案件の独自フォームはその案件の業務モジュールが所有するため、雛形の `core/inquiry` で置換しない。

## 取り込まないもの

案件側は読み取り専用の設計参考とし、ソース全体をコピーしない。会社情報・固有本文・デザイン・画像・CSS・図版JSON・取り込みデータ・メディア対応表・リダイレクトは含めない。固有の分類・項目・フォームID・確認トークン互換・自動返信Global・通知lease・旧保存仕様も含めない。Canonicalパス移行、production host判定、環境・配信設定、依存バージョンも変更しない。
