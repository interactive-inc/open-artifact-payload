---
name: section-from-image
description: "スクリーンショット画像から案件固有セクションコンポーネントを生成する。画像からのセクション生成、Figma が無い案件でのコンポーネント生成時に使用。/section-from-image で呼び出す。"
user_invocable: true
arguments: 画像ファイルパス
---

# section-from-image

`section-from-design` の画像版。Figma が無い案件ではこちらを使う。

## 前提

- ガードレール: `CLAUDE.md` の「生成 AI のガードレール」章
- 対象ファイルは `src/project/` 配下のみ。`src/core/` は読み取り専用

## 手順

### フェーズ1: 情報収集

- `.claude/rules/cms-design.md` を読み、フィールド設計の判断基準を把握する
- `src/core/sections/` の既存セクション（hero-section / featured-news-section / rich-text-section / cta-section）を読み、実装パターンを把握する
- 引数で受け取った画像ファイルを `Read` ツールで読み、レイアウトと色を目視で把握する
- context7 で Payload CMS のフィールド定義の公式ドキュメントを必要に応じて参照する

### フェーズ2: フィールド設計の決定

- 画像のレイアウトから、cms-design.md の「UI要素 → フィールド型の対応表」を使ってフィールド構成を決定する
- 「編集可能 vs 固定の判断基準」に従い、どの要素をフィールド化するか決める
- 画像だけからフィールド構造を推定できない場合は `AskUserQuestion` でフィールド名/型をユーザーに確認する

### フェーズ3: コード生成

- `section-from-design` と同じ生成ルールでセクションを作る
  - 置き場所の判定:
    - そのページでしか使わない → `src/project/pages/<page>/sections/<kebab-name>.tsx`
    - 最初から 2 ページ以上で使う → `src/project/shared/sections/<kebab-name>.tsx`
  - Tailwind テーマ: `src/app/(frontend)/[locale]/styles.css` の `@theme` / `:root` に定義済みのトークンを使う
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
- `vp run generate:types && vp lint && vp run test:int` を実行して通ったことを確認する

## ルール

- フィールドラベル日本語、フィールド名 lowerCamelCase
- hex 直書き禁止
- `src/core/` を書き換えない
- 生成セクションは `'use client'` を付けない（Server Component で Payload データを受け取る前提）
