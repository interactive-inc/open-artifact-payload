# 構成改善の検証記録

日付: 2026-09-09

対象は `miyagi9305/template-source-layout`。作業開始時のHEADとorigin/mainは、指定の `445152e74c7024497ed54b1339dac02dbe8c9112` に一致し、作業ツリーはクリーンだった。以下の比較におけるベースはこのコミットを指す。元checkoutと参照元案件は編集していない。この記録はローカル実装検証時点の結果であり、GitHub Actionsの結果はPRで別途確認する。

## 実装範囲の確認

- 旧 `src/project` の102ソースファイルを役割別に移動。import書き換えと空白・整形を正規化してHEADの原文と比較し、本文・スタイル・データ・ロジックの差分は0件
- home-gridと専用Storyはトップrouteの `_sections`、worksラベルはworksの `_lib`。共通UI・CMS・言語・SEO・scriptsは新配置を直接参照する
- coreの6契約をCMS/i18nへ変更。旧配置のfacadeやaliasは作らず、旧ディレクトリを削除。境界ガードは実import、型import、re-export、動的import、require、Payloadのコンポーネントパスを検査する
- 問い合わせは雛形の既存処理から分離。既存の6分類・ja/enラベル・上限・制御文字・任意項目・未選択許容・Turnstile本番必須・rate key・保存・通知・再送・権限を維持。問い合わせ専用のメール処理も `core/inquiry` が所有する
- 案件固有の会社情報・本文・デザイン・メディア・入力項目・分類・確認token・通知lease等は取り込んでいない。packageのscripts以外とbun.lockはHEADと一致し、依存バージョン・環境・配信設定・DBスキーマの変更はない
- README / CLAUDE / AGENTS / architecture / guide / 導入brief / `.claude` の生成スキル・CMS規則・テスト戦略を同期。旧パスが残るのは移行表・削除済み資産の履歴・拒否テストのみ

## テスト実行経路

`vp test list --filesOnly --json` の実収集とファイルシステムを照合し、unit 5ファイル、integration 77ファイル、重複0、欠落0を確認。HEADの対象79ファイルは、77ファイルを継続し、既存の検証分岐・依存方向の2ファイルをunitへ移動している。新規追加を含む合計は82ファイル。

packageの `test` / `test:ci` と実際の `.github/workflows/ci.yml` はunit/integrationを各一度実行する。packagesはintegrationに含め、test:toolsをCIで重ねない。Cloudflare設定specもintegrationで実行し、test:cloudflare-configはdry-runと型の整合性だけを確認する。

## 完了した検証

| 検証                                    | 結果                                                                                                                              |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `vp install`                            | 成功。lockfileと依存バージョン変更なし                                                                                            |
| `vp check`                              | format / lint / 型チェック成功、warning 0                                                                                         |
| `vp test run`                           | 82ファイル・428件成功                                                                                                             |
| 最終 `vp run test:ci`                   | check、unit 80件、integration 348件、Cloudflare fixtureのdry-run・型整合性は成功。依存監査のみ失敗（下記）                        |
| `vp run test:unit` の隔離測定           | 5ファイル・80件成功、setup 0ms                                                                                                    |
| `generate:types` / `generate:importmap` | 成功。Payload型は説明コメントの配置名だけ変化。importMapとCloudflare型は変更なし。再生成前後の3ファイルのSHA-256も一致            |
| `vp run build`                          | 成功。Next.js 16.3.0 webpack、ローカル使い捨てD1を使用                                                                            |
| E2E                                     | 26件成功。管理画面編集、ライブプレビュー、公開/下書き分離、問い合わせ、FAQ、news、works、preview認可                              |
| Storybook（開発版・静的版）             | 両方とも19ファイル・55/55 story成功、重大a11y違反0。静的buildも成功                                                               |
| 日英・responsive                        | `/ja/contact`、`/en/contact`、`/en`、`/ja` が200、1440px / 390pxで横はみ出し0、pageerror 0。6分類と英語ラベルを照合し画像でも確認 |
| `setup:project`                         | 使い捨てディレクトリで成功。D1/R2作成なし、新配置・seedパス・更新済みbriefのコピーを確認                                          |
| shadcn `info --json`                    | `_components` / `_ui` / `_hooks` / `_lib` の解決先を確認                                                                          |

unitの隔離測定では、SDKロードとPayload/Wrangler/workerd等の起動を拒否するNode hookを有効にし、DB保存先も `/dev/null/unit-must-not-prepare-db` として実行した。DB setupや外部runtimeの読み込みが起きれば失敗する条件でも全件成功した。

Storybookの初回確認では括弧を含むglobがfrontendのstoryを取りこぼしたため、`src/app/**` の探索へ修正した。全storyファイルと実際のindexを照合する検査を追加し、開発版・静的版の両方で全19ファイル・55 storyが含まれることを再検証した。coreだけの初回22件の結果は最終合格に数えていない。

## 検証環境と制約

実 `.env`・既存DBはコピーしていない。integrationは専用worktree内の `.wrangler/state-test`、buildと型生成は `.wrangler/state-layout-validation` を使用。メールは未設定によるconsole/skip、通知テストはstubで、実配信なし。

E2Eは現在のworktreeから、追跡ファイルと新規ソースのみを `/private/tmp/template-layout-e2e-20260909` にコピーした。変更は検証用のlocalhost 3000→3100と準備harnessの適用に限定し、node_modulesはこのworktreeのインストールを参照した。3000 / 3001 / 3002の別アプリは停止していない。

既存の `prepare-e2e.ts` はfixture投入後にプロセスが終了しなかったため、harnessで元helperのimport（finallyのcleanupを含む）の完了を待ち、その後に終了させた。helper本体やアプリの挙動は変更していない。E2EはTurnstileの公開テストキーでウィジェット・Siteverifyを通して実行した。成功後に検証ユーザー/APIキーを削除し、検証用サーバーも停止した。

追加表示確認ではTurnstile等の通信が続くため `networkidle` 待ちを使わず、DOMと対象要素の確認後に撮影した。匿名アクセス、desktop 1440×1000 / mobile 390×844。スクリーンショットは `/tmp/product-test/visual/template-layout`、一時ログ・検証script・source manifestは `/private/tmp/template-layout-verification` にあり、リポジトリには含めない。

buildの既存middleware非推奨警告や、Nextのリクエスト外のrevalidate警告は残る。今回の配置変更に混ぜてframework移行や別件修正は行っていない。本番の配信・リモートDB・実メール配送は検証対象外。

## 既存依存の監査結果

`test:ci` 全体の終了コードは1。最後の `bun audit --audit-level=high` が4件（critical 2 / high 2）を報告した。HEADのpackage.jsonとbun.lockを別の使い捨てディレクトリへ取り出して監査し、同じadvisory一覧と終了コード1を再現した。今回の変更で追加した依存やバージョン差分はない。

- Next.js 16.3.0: [Windowsホスト向けの指摘](https://github.com/advisories/GHSA-p293-qw3h-jr36)、[AVIF画像最適化APIの指摘](https://github.com/advisories/GHSA-2xp9-vwfh-vxw4)（監査はcriticalとして報告）
- sharp 0.35.3: [libheifに関する指摘](https://github.com/advisories/GHSA-rgj7-g3m4-5g8c)（high）
- js-yaml: [merge key処理のCPU使用量に関する指摘](https://github.com/advisories/GHSA-2883-xcg3-v3hh)（high）

これは構成改善の初回検証時点の依存監査結果であり、このアプリの本番環境における各問題の成立条件を検証したものではない。その後、ユーザーから依存更新も依頼されたため、同じPRでNext.js 16.3.4、sharp 0.35.4、js-yaml 4.3.2へ更新した。更新方針と残るmoderateの監査結果は [セキュリティ方針](../security.md#依存監査) を参照する。

## PRレビュー後の追加検証

PR #77の自己レビューで、問い合わせCollectionだけが利用するPayloadメール検証が共通libに残っていることを確認した。`core/inquiry/infrastructure/validate-contact-email.ts` へ移し、`core/lib` から問い合わせ処理への依存を拒否する境界検査を追加した。検証ロジック・保存条件の変更はない。

修正後に `vp check`、`vp test run`（82ファイル・429件: unit 81 / integration 348）、SDKとDB/runtime起動を拒否したunit単独実行（81件、setup 0ms）が成功した。型・importMapも再生成し、3生成物のSHA-256が修正前と一致することを確認した。上表のE2E・build・Storybookはこの追加の配置修正前のローカル結果であり、PRの最終コミットに対するGitHub Actionsの結果とは区別する。

## 依存更新後の検証

ユーザーからの追加依頼でNext.js 16.3.4、sharp 0.35.4、js-yaml 4.3.2へ更新した後、管理対象のBun 1.3.14で `vp run test:ci` 全体が終了コード0となった。check、unit 81件、integration 348件、Cloudflare fixtureのdry-run・型整合性、high以上の依存監査がすべて成功している。監査条件の緩和や検査の削除は行っていない。

型・importMapも更新後の依存で再生成し、Payload型・Cloudflare型・importMapの3生成物は更新前とSHA-256が一致した。lockfileの変更はNext.js・sharp・js-yamlと、その更新に必要なSWC・プラットフォーム別バイナリ・libvipsだけである。build / E2E / Storybookを含む最終コミットのCI結果はPR #77のChecksで確認する。
