# src/core/

本体由来のコードを置く場所。案件リポジトリでは原則触らない。

改善や修正が必要な場合は、案件リポジトリで直接編集せず、本体テンプレートリポジトリに PR を送る。案件側で本体追従したいときは `git remote add upstream` と `git subtree pull --prefix=src/core upstream main` を使う。

構造

- collections/  コア共通コレクション (users, media, news, faq, pages, contact-submissions)
- globals/      コア共通グローバル (site-settings)
- admin/        管理画面カスタマイズ (ダッシュボード、ブランディング)
- sections/     汎用セクション React コンポーネント
- frontend/     共通レイアウト用コンポーネント
- lib/          共通ユーティリティ
- payload/      payload.config のベース
- scripts/      セットアップスクリプト
