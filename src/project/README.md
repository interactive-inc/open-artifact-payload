# src/project/

案件ごとに書くコードを置く場所。新規ファイル作成は基本ここに限定する。

構造

- pages/<page>/        ページ単位のコロケーション
  - global.ts          Payload Global 定義 (export 名は <name>Global)
  - sections/          そのページ専用のセクション React コンポーネント
  - components/ hooks/ lib/  そのページ専用の補助モジュール
- shared/              複数ページで使う資産
  - sections/          2 ページ以上で使うセクション (site-header / site-footer など)
  - components/        汎用 UI コンポーネント (フラット配置)
  - ui/                shadcn/ui 所管領域 (bunx shadcn add の配置先)
  - hooks/ lib/        汎用フック / util
- collections/         案件固有コレクション (tours, staff, cases など)
- admin/               ダッシュボードタスク定義、feature flag
- theme/               Tailwind テーマ (色・フォント)

セクションをどこに置くか:

- そのページでしか使わない → `pages/<page>/sections/`
- 最初から 2 ページ以上で使うことが決まっている → `shared/sections/`
- 1 ページ用に作った後に再利用したくなった → `pages/*/sections/` から `shared/sections/` に移動

生成ルール

- セクション group フィールドには `enabled` チェックボックスを必ず含める
- フィールドラベルは日本語、フィールド名は lowerCamelCase
- hex 直書き禁止、Tailwind のテーマトークンを使う
- 生成後は `bun run lint` と `bun run generate:types` を流す
