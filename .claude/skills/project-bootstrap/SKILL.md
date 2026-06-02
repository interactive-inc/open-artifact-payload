---
name: project-bootstrap
description: '.docs/project-brief.md を読み込んで案件の骨格ファイルを一気に生成する。案件セットアップ、プロジェクト初期化、骨格生成、ボイラープレート生成などのリクエスト時に使用。/project-bootstrap で呼び出す。'
user_invocable: true
---

# project-bootstrap

`.docs/project-brief.md` を Single Source of Truth として、案件の骨格（Global、Collection、セクション、テーマ等）を一括生成する。

## 前提

- 参照: `docs/superpowers/specs/2026-04-11-payload-cms-template-design.md`
- ガードレール: `CLAUDE.md` の「生成 AI のガードレール」章
- 対象ファイルは `src/project/` 配下のみ。`src/core/` は読み取り専用

## フェーズ1: 情報収集

### project-brief の読み込み

`.docs/project-brief.md` を読む。以下の項目が揃っているか確認する:

- サイト名 / クライアント名
- ページ構成（トップ、下層ページ一覧）
- 各ページのセクション構成
- コレクション要件（お知らせ、FAQ 等）
- デザイントークン（ブランドカラー、フォント等）
- ダッシュボードタスク

欠けている項目があれば `AskUserQuestion` でユーザーに確認する。

### CMS 設計ルールの把握

`.claude/rules/cms-design.md` を読み、以下を把握する:

- UI要素 → フィールド型の対応表
- 編集可能 vs 固定の判断基準
- セクション group の必須ルール
- 繋ぎ込みチェックリスト
- D1 (SQLite) 固有の制約

### 既存セクションの実装パターン把握

`src/core/sections/` の既存セクション（hero / featured-news / rich-text / cta）を読み、以下を把握する:

- フィールド定義の書き方
- セクションコンポーネントの props 型
- `enabled` チェックの実装パターン
- 画像の `resolveMediaUrl()` / `resolveMediaAlt()` の使い方
- リッチテキストの `RichText` コンポーネントの使い方

### 公式ドキュメントの参照

context7 プラグインで Payload CMS の以下を参照する:

- Global のフィールド定義
- Collection のフィールド定義
- `findGlobal` / `find` の depth オプション

## フェーズ2: フィールド設計の決定

project-brief のセクション記述から、`.claude/rules/cms-design.md` の「UI要素 → フィールド型の対応表」を使ってフィールド構成を決定する。

判断の手順:

- セクションの各要素を対応表の UI 要素に分類する
- 「編集可能 vs 固定の判断基準」に照らして、フィールド化するか固定するかを決める
- 件数が変動するものは Collection、固定のものは Global の group / array で管理する
- 記述が曖昧な場合は対応表で自律的に判断する
- 判断に自信がない場合のみ `AskUserQuestion` でユーザーに確認する

## フェーズ3: コード生成

以下のファイルを生成する:

### Global 定義

`src/project/pages/<page>/global.ts` - 固定ページごとに 1 ファイル
export 名は `<name>Global`（例 `homeGlobal`, `aboutGlobal`）

ライブプレビュー対応のため以下を必ず含める:

- `versions: { drafts: true }` を設定する（下書きプレビューが成立する）
- `array` フィールドを含む Global で autosave を有効化すると D1 で `_uuid` 問題が出るので、`autosave` は付けない

生成した Global の slug を `src/payload.config.ts` の `livePreviewGlobals` に追加することも忘れない。
slug が `home` / `top` など `home-page` 以外の場合は、`livePreviewUrl` で URL マッピングを明示する必要がある（`buildCoreConfig` の `livePreviewUrl` prop）。

### Collection 定義

`src/project/collections/*.ts` - 案件固有コレクション

### セクションコンポーネント

- `src/project/pages/<page>/sections/*.tsx` - そのページでしか使わないセクション
- `src/project/shared/sections/*.tsx` - 2 ページ以上で使うセクション（site-header / site-footer / contact-cta など）

素の Tailwind で仮デザインを当てる。shared/sections に置くかどうかは「最初から 2 ページ以上で使うことが確定しているか」で判定する。

### 管理画面カスタマイズ

`src/project/admin/dashboard-tasks.ts` - project-brief のダッシュボードタスク列を反映

### Feature Flag

`src/project/project-features.ts` - 汎用ページ feature flag の ON/OFF

### テーマ

`src/project/theme/tailwind.theme.ts` - project-brief のデザイン欄を反映

### Payload 設定への登録

`src/payload.config.ts` に project globals と collections の import を追加する（`@/project/pages/<page>/global` から `<name>Global` を import）。
併せて `livePreviewGlobals` に生成した全 Global の slug を追加し、必要に応じて `livePreviewUrl` で URL マッピングを定義する。

### フロントエンドの下書きプレビュー対応

`src/app/(frontend)/layout.tsx` と各 `page.tsx` は以下の形でテンプレから提供される前提:

- layout.tsx は `<RefreshRouteOnSave />` を常時レンダリング（Payload 管理画面からの保存イベントで iframe をリフレッシュ）
- page.tsx は `const draftState = await draftMode()` と `payload.findGlobal({ ..., draft: draftState.isEnabled })` / `payload.find({ ..., draft: draftState.isEnabled })` を必ず通す

案件で新しいページを追加する場合も同じパターンで書く。

### テスト

`tests/int/sections/` に各セクションの最小スモークテストを追加する（enabled=true / enabled=false の 2 ケース）

## フェーズ4: 自己検証

### 繋ぎ込みチェックリスト

`.claude/rules/cms-design.md` の「繋ぎ込みチェックリスト」を全項目チェックする:

- Global のフィールド名とセクションコンポーネントの `props.data.xxx` 参照が完全に一致しているか
- セクションコンポーネントの先頭で `if (!props.data.enabled) return null` しているか
- ページ側で `{home.sectionName?.enabled && <Section data={home.sectionName ?? {}} />}` の形になっているか
- `upload` フィールドの画像は `resolveMediaUrl()` / `resolveMediaAlt()` で解決しているか
- `relationship` フィールドを使うページ側の `payload.findGlobal()` / `payload.find()` に `depth: 2` 以上を指定しているか
- `array` フィールドを含む Global で `autosave` を使う場合、D1 の `_uuid` カラム問題を認識しているか
- `generate:types` 後の Payload 生成型と、セクションコンポーネントの型定義が整合するか
- Tailwind クラスで hex を直書きせず `src/project/theme/tailwind.theme.ts` のトークンを使っているか

1 つでも不整合があれば生成をやり直す。

### 自動検証

```bash
bun run generate:types && bun run lint && bun run test:int
```

全て通ったことを確認してからコミットを提案する。

## ルール

- 各セクション group には `enabled: checkbox` を必ず含める
- `enabled` の label は `表示する`、defaultValue は `true`（CTA 系は `false`）
- フィールドラベル = 日本語、フィールド名 = lowerCamelCase
- 色は Tailwind theme トークン経由（`bg-brand` `text-accent` 等）
- hex を直接書かない
- 相対 import を避け `@/project/...` `@/core/...` を使う
- `select` フィールドの value は英語、label は日本語
- `array` フィールドと `autosave` の併用に注意（D1 制約）
