# src/core/

本体由来のコードを置く場所。案件リポジトリでは原則触らない。

改善や修正が必要な場合は、案件リポジトリで直接編集せず、本体テンプレートリポジトリに PR を送る。案件側で本体へ追従するときは、テンプレートを `upstream` remote に追加して `git merge upstream/main` で取り込む（手順は `.docs/guide.md` の「テンプレート更新の取り込み」）。

構造

- collections/ コア共通コレクション (users, media, news, faq, pages, contact-submissions)
- globals/ コア共通グローバル (site-settings)
- admin/ 管理画面カスタマイズ (ダッシュボード、ブランディング)
- sections/ 汎用セクション React コンポーネント
- frontend/ 共通レイアウト用コンポーネント
- lib/ 共通ユーティリティ
- payload/ payload.config のベース
- scripts/ セットアップスクリプト
