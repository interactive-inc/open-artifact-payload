# 人間の判断が必要なタスク

このファイルは Inta CMS テンプレートのリファクタリングで洗い出された、人間 (プロダクト/デザイン/運用担当) の判断が必要な項目をまとめたものです。各項目には Claude が採用した暫定対応 (デフォルト) を記載しています。デフォルトのままで問題なければ対応不要です。変更したい場合のみ判断してください。

調査は 9 観点の自動監査 (バグ / TypeScript ルール / デザイントークン / CMS 設計 / コロケーション / React パターン / テスト / Storybook / 仕様整合) で計 108 件の指摘を抽出し、機械的に修正できるものは実装済み、判断を要するものを以下に残しています。

## デザイン

### カラートークンの確定値

暫定対応として、フロント用のトークンを管理画面 (custom.scss) のモノクロ系パレットに揃えて定義しました。

採用値: `surface=#ffffff` / `foreground=#111212` / `muted=#767979` / `border=#d2d4d5` / `error=#c42b2b` / `success=#2d7a4f`、ブランド色は既存維持 (`brand=#1a5f7a` / `accent=#ff6b35`)。

判断事項: 実案件のブランドガイドに合わせて hex を差し替えるか。差し替える場合は `src/project/theme/tailwind.theme.ts` の該当値のみ変更すれば全コンポーネントに反映されます。

補足 (アクセシビリティ): アクセントカラー (#ff6b35) の上に白文字を載せた CTA ボタン (ヒーロー / CTA セクション) はコントラスト比が約 2.8:1 で WCAG AA を下回ります。ブランド表現の判断になるため自動修正していません。AA を満たすにはアクセントを少し暗くする (例 #e85a26) か、CTA の文字色を濃色に変更してください。補助テキスト (muted) は AA を満たす濃さ (#5c5f5f) に調整済みです。

### セクション余白とコンテナ幅のトークン

暫定対応として、`src/core/lib/theme-tokens.ts` の値を Tailwind に配線し、`py-section` (96px) / `py-section-sm` (56px) / `max-w-container` (1200px) / `max-w-prose` (768px) / `max-w-wide` (896px) を定義してセクションの余白とコンテナ幅を統一しました (従来は py-16/20/24・max-w-3xl/4xl/6xl が混在)。

判断事項: この余白リズムとコンテナ幅で良いか。変更する場合は `tailwind.theme.ts` / `theme-tokens.ts` の値を調整します。

### サイトヘッダー / フッターのデザイン

暫定対応として、`site-settings` グローバルのデータ (ロゴ / サイト名 / ヘッダーナビ / フッターナビ / ポリシーリンク / SNS / フッターテキスト) を描画する最小構成のヘッダーとフッターを `src/project/shared/sections/` に新設し、フロントの共通レイアウトに組み込みました。これまでこれらの入力欄はどこにも表示されていませんでした。

判断事項: レイアウトやスタイルの作り込み (ドロワーメニュー、ロゴサイズ、レスポンシブ挙動など) は案件デザインに合わせて調整が必要です。デザインが決まり次第このセクションを更新してください。

## 機能 / プロダクト

### Cloudflare Turnstile (スパム対策)

暫定対応として、Turnstile を正しく動作するよう実装しました (api.js のロード、`cf-turnstile-response` トークンの整合、検証失敗時の fail-closed)。`turnstileSiteKey` が未設定のローカル開発では従来どおり検証をスキップします。

判断事項: 本番でスパム対策に Turnstile を採用するか。採用する場合は Cloudflare で Turnstile サイトを作成し、サイトキーを管理画面の「サイト設定」に、`TURNSTILE_SECRET_KEY` を Cloudflare Secret Store に登録してください。採用しない場合は問い合わせフォームの Turnstile 関連と site-settings のサイトキー項目を削除します。

### 汎用ページ (free pages) 機能

暫定対応として、SEO を seoPlugin に一本化しました (pages の手書き meta グループを削除し、`enableFreePages` が true のときプラグインが自動で `pages` を対象に含める)。デフォルトでは `enableFreePages: false` のまま据え置きです。

フロントの `app/(frontend)/[slug]/page.tsx` ルートは「あえて同梱していません」。理由: `enableFreePages` が false のときは `pages` コレクションの型が生成されず、ルートを同梱すると型エラーでビルドが壊れるためです。有効化手順 (フラグ ON → `generate:types` → `[slug]` ルート追加) は `.docs/guide.md` の「汎用ページ機能の有効化」節に記載しました。

判断事項: テンプレート標準で汎用ページ機能を有効にするか。有効化する場合は上記手順に従ってください。`news/[slug]/page.tsx` が実装の参考になります。

### 問い合わせ完了画面の方式

暫定対応として、従来どおり専用ルート `/contact/thanks` への遷移を維持しつつ、フルリロード (`window.location.href`) をやめてサーバーアクションの `redirect` に変更しました。

判断事項: 完了表示を専用ルートのままにするか、`/contact` 内で完了状態を表示する方式に変えるか。専用ルートは URL 直打ちでも到達できる点に留意してください。

## 運用 / 環境

### 本番シークレットと環境変数の登録

判断事項: 本番デプロイ前に以下を登録してください。`PAYLOAD_SECRET` (必須)、`NEXT_PUBLIC_SERVER_URL` (ライブプレビュー / メタ URL 解決用)、`TURNSTILE_SECRET_KEY` (Turnstile 採用時)、`RESEND_API_KEY` / `EMAIL_FROM` (認証メール・問い合わせ通知メール採用時)、`CONTACT_NOTIFICATION_EMAIL` (問い合わせ通知メール採用時)、`SUPPORT_EMAIL` (管理画面ヘルプリンク)。本番では未設定の `PAYLOAD_SECRET` で起動失敗するよう変更済みです。

### 最初の管理者ユーザーのロール

判断事項: `users` の `roles` 既定値は `editor` です。初回ユーザー作成時はロールで「管理者」を選択してください (編集者のままだとユーザー管理や設定変更ができません)。テンプレートとして初回ユーザーを自動的に admin にするかは要判断 (現状は手動選択)。

## ドキュメント規約

### README の言語

暫定対応として、`README.md` は GitHub 向けの慣例として英語見出しを許容する方針とし、`.claude/rules/md.md` に「README は対象外」の例外を明記しました。

判断事項: `md.md` の「日本語で書く」ルールを README にも適用したい場合は README の見出しを日本語化します。
