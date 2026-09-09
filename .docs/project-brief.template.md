# プロジェクト概要

- クライアント:
- 業種:
- 目的:
- 納品先: (Cloudflare Workers の Worker 名 / ドメイン)

# サイトマップ

- トップページ
- (追加)

# 固定ページの構成

## トップページ

- ヒーロー (画像 + キャッチコピー + CTA ボタン)
- (追加)

# 案件固有コレクション

- (例) tours: title, slug, thumbnail, departureDate, price, body

# ダッシュボードタスク

- お知らせを追加する [primary]
- トップページを編集する [primary]
- 画像を差し替える [secondary]

# 汎用ページ機能

- 無効

# デザイン

- キーカラー:
- アクセント:
- フォント:
- 雰囲気:

## 実装の配置

生成先は `src/README.md` を正本とする。公開ページ本文と専用部品はURLのroute周辺、CMS定義は `src/cms`、言語は `src/i18n`、metadataは `src/seo`、運用スクリプトは `src/scripts` に置く。共通libは業務知識なしで使える技術処理だけにし、小さい機能に空の層を作らない。
