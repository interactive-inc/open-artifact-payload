---
name: add-collection
description: '既存案件に新しいコレクションを追加する。コレクション追加、新規コレクション作成時に使用。/add-collection で呼び出す。'
user_invocable: true
---

# add-collection

新規コレクションを対話形式で追加する。

## 前提

- ガードレール: `CLAUDE.md` の「生成 AI のガードレール」章
- 対象ファイルは `src/project/` 配下のみ。`src/core/` は読み取り専用

## 手順

### フェーズ1: ヒアリング

`AskUserQuestion` で以下を順に確認する:

- コレクション slug（英小文字とハイフン）
- 日本語ラベル（単数/複数）
- フィールド一覧（type, label, required）
- 一覧用セクションを作るか
- ダッシュボードタスクに追加するか

### フェーズ2: コード生成

以下を生成する:

- `src/project/collections/<slug>.ts`
- 一覧用セクションを作る場合:
  - そのコレクションが 1 ページでしか使われない → `src/project/pages/<page>/sections/<slug>-list-section.tsx`
  - 複数ページで使う（例: ホームと /news 両方） → `src/project/shared/sections/<slug>-list-section.tsx`
- `src/payload.config.ts` に import 追加
- `src/project/admin/dashboard-tasks.ts` への追記（必要な場合）

### フェーズ3: マイグレーションと検証

- `bun run payload migrate:create project_<slug>` を実行する
- `bun run payload migrate` でローカル D1 に反映する
- `bun run generate:types && bun run lint && bun run test:int` を流す
- 結果をユーザーに報告してコミットを提案する

## ルール

- 生成先は `src/project/` 配下のみ
- フィールドラベル日本語/フィールド名 lowerCamelCase
- `src/core/` を一切触らない
- サイドバーアイコンは自動で付く（コンテンツグループは汎用ページアイコンを一括適用）。個別アイコンを指定したい場合のみ `src/app/(payload)/custom.scss` の「ナビアイコン」節に `#nav-<slug>::before { @include mask-icon($icon-xxx); }` を追加する
