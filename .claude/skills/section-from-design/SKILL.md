---
name: section-from-design
description: "Figma URL から案件固有セクションコンポーネントを生成する。Figmaデザインからのセクション生成、コンポーネント生成時に使用。/section-from-design で呼び出す。"
user_invocable: true
arguments: Figma URL (figma.com/design/...)
---

# section-from-design

引数の Figma URL からデザイン情報を取得してセクションを生成する。

## 前提

- ガードレール: `CLAUDE.md` の「生成 AI のガードレール」章
- 対象ファイルは `src/project/` 配下のみ。`src/core/` は読み取り専用

## 手順

### フェーズ1: 情報収集

- `.claude/rules/cms-design.md` を読み、フィールド設計の判断基準を把握する
- `src/core/sections/` の既存セクション（hero-section / featured-news-section / rich-text-section / cta-section）を読み、実装パターンを把握する
- 引数の Figma URL から fileKey と nodeId を抽出する
- `mcp__claude_ai_Figma__get_design_context` を呼び出して、コードと screenshot を取得する
- context7 で Payload CMS のフィールド定義の公式ドキュメントを必要に応じて参照する

### フェーズ2: フィールド設計の決定

- Figma のデザインを見て、cms-design.md の「UI要素 → フィールド型の対応表」を使ってフィールド構成を決定する
- 「編集可能 vs 固定の判断基準」に従い、どの要素をフィールド化するか決める
- 判断に自信がない場合のみ `AskUserQuestion` でユーザーに確認する

### フェーズ3: コード生成

- 返ってきた React / Tailwind コードを参考にしつつ、以下に寄せて移植する
  - 置き場所の判定:
    - そのページでしか使わない → `src/project/pages/<page>/sections/<kebab-name>.tsx`
    - 最初から 2 ページ以上で使う → `src/project/shared/sections/<kebab-name>.tsx`
  - Tailwind テーマ: `src/project/theme/tailwind.theme.ts` に定義済みのトークンを使う
  - 画像は Payload Media relationship 経由 (`type: 'upload', relationTo: 'media'`) にする
  - 画像の URL 解決は `resolveMediaUrl()` / `resolveMediaAlt()` (`@/core/lib/media`) を使う
- 対応する Global が既にある場合、フィールドが足りていなければ `src/project/pages/<page>/global.ts` に group フィールドを追記する（必ず `enabled` checkbox を含める）
- ページ側（`src/app/(frontend)/` 配下）に条件レンダリングを追加する

### フェーズ4: 自己検証

`.claude/rules/cms-design.md` の繋ぎ込みチェックリストを全項目チェックする:

- Global のフィールド名とセクションコンポーネントの `props.data.xxx` 参照が完全に一致しているか
- セクションコンポーネントの先頭で `if (!props.data.enabled) return null` しているか
- ページ側で `{home.sectionName?.enabled && <Section data={home.sectionName ?? {}} />}` の形になっているか
- `upload` フィールドの画像は `resolveMediaUrl()` / `resolveMediaAlt()` で解決しているか
- `relationship` フィールドを使うページ側の `payload.findGlobal()` / `payload.find()` に `depth: 2` 以上を指定しているか
- `array` フィールドを含む Global で `autosave` を使う場合、D1 の `_uuid` カラム問題を認識しているか
- `generate:types` 後の Payload 生成型と、セクションコンポーネントの型定義が整合するか
- Tailwind クラスで hex を直書きせず テーマトークンを使っているか

1つでも不整合があれば該当箇所を修正する。

- `tests/int/sections/<kebab-name>.int.spec.tsx` に enabled=true / enabled=false のスモークテストを追加する
- `bun run generate:types && bun run lint && bun run test:int` を実行して通ったことを確認する

## ルール

- フィールドラベル日本語、フィールド名 lowerCamelCase
- hex 直書き禁止
- `src/core/` を書き換えない
- 生成セクションは `'use client'` を付けない（Server Component で Payload データを受け取る前提）
