# src/core/

本体由来のコードを置く場所。案件リポジトリでは原則触らない。本体テンプレートの開発では、共通コード・設定・テストを必要範囲で変更できる。

改善や修正が必要な場合は、案件リポジトリで直接編集せず、本体テンプレートリポジトリに PR を送る。案件側で本体へ追従するときは、テンプレートを `upstream` remote に追加して `git merge upstream/main` で取り込む（手順は `.docs/guide.md` の「テンプレート更新の取り込み」）。

構造

- collections/ コア共通コレクション (users, media, news, faq, pages, contact-submissions)
- globals/ コア共通グローバル (site-settings)
- admin/ 管理画面カスタマイズ (ダッシュボード、ブランディング)
- sections/ 汎用セクション React コンポーネント
- frontend/ 共通レイアウト・フォームの表示
- inquiry/ 雛形の問い合わせの入力規則・受付手順・外部接続・Server Action
- lib/ 共通ユーティリティ
- payload/ payload.config のベース
- scripts/ セットアップスクリプト

公開UI・案件CMS・言語・SEOの配置は [src/README.md](../README.md)、coreが参照できる6契約は [architecture](../../.docs/architecture.md) を参照する。upstream mergeで旧配置とのrename/delete競合が起きた場合、案件の実装を役割別の新配置へ移し、importと生成物・設定を更新してから旧ファイルを削除する。coreだけを旧契約に戻さない。削除条件は [構成移行](../../.docs/decisions/007-source-layout-and-inquiry-boundaries.md) を確認する。
