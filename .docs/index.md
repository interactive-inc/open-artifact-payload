# Inta CMS

Inta CMS は、Payload CMS と Cloudflare を使って企業サイトを構築・運用するためのテンプレートです。管理画面だけでなく、自動化や AI クライアントからも既存の権限制御を保ったままコンテンツを更新できることを目指します。

## 提供価値

- 案件固有コードとテンプレート本体の境界を保ち、サイトを継続的に拡張できる
- 管理画面、[[features/site-tools|CLI と公式MCP]]のどこから操作しても Payload の認証・検証・フックが働く
- [[architecture|モノレポとレイヤー境界]]により、外部操作の追加でサイト UI を複雑にしない

## 製品ドキュメント

- [[guide|運用ガイド]]
- [[architecture|アーキテクチャ]]
- [[domain|ドメインモデル]]
- [[features/site-tools|CLI / MCP によるサイト操作]]
- [[decisions/001-site-management-boundary|サイト管理境界の設計判断]]
- [[decisions/002-official-payload-mcp|公式Payload MCPの採用]]
- [[decisions/003-intacms-cli|Hiract型intacms CLIの採用]]
- [[decisions/004-template-update-by-upstream-merge|雛形更新の Git マージ配布]]
