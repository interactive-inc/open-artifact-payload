---
name: add-story
description: "既存コンポーネントに Storybook のストーリーを追加する、または新規コンポーネントとストーリーをセットで生成する。コンポーネントの動作確認/カタログ化、UIレビュー用ストーリー作成時に使用。/add-story で呼び出す。"
user_invocable: true
arguments: コンポーネントのパス（省略可。省略時は対話で決定）
---

# add-story

Storybook のストーリーを対話形式で生成する。コンポーネントが無ければ先に生成する。

## 前提

- ガードレール: `CLAUDE.md` の「生成 AI のガードレール」章
- 対象ファイルは `src/project/` 配下のみ。`src/core/` は読み取り専用
- Storybook は `@storybook/nextjs-vite` 10.x を使用
- 既存例: `src/project/shared/components/button.stories.tsx`

## 手順

### フェーズ1: 対象の特定

引数または `AskUserQuestion` で以下を確認する。

- 対象コンポーネントのパス（例: `src/project/shared/components/card.tsx`）
- 既存コンポーネントなら → ストーリーのみ追加
- 未作成なら → コンポーネント仕様（props, variant, 用途）をヒアリングしてから生成

コンポーネントを新規に作る場合の置き場所は以下で判断する。

- そのページでしか使わない → `src/project/pages/<page>/components/<kebab-name>.tsx`
- 複数ページで使う / 汎用 → `src/project/shared/components/<kebab-name>.tsx`
- shadcn/ui 由来 → `src/project/shared/ui/<kebab-name>.tsx`（このスキルでは触らない）
- セクション（Payload データを受ける） → `pages/<page>/sections/` または `shared/sections/`

### フェーズ2: 情報収集

- 対象コンポーネントを `Read` し、`type Props` から controls 対象を抽出する
- `src/project/shared/components/button.stories.tsx` をテンプレとして読む
- セクションコンポーネントの場合は `src/core/sections/hero-section.tsx` などを読み、受け取る data 型を把握する
- context7 で Storybook の公式ドキュメント（argTypes, decorators, play 関数）を必要に応じて参照する

### フェーズ3: ストーリー生成

ストーリーファイルは対象コンポーネントと同じディレクトリに `<name>.stories.tsx` として置く。

テンプレ:

```tsx
import type { Meta, StoryObj } from "@storybook/nextjs-vite"

import { ComponentName } from "./component-name"

const meta: Meta<typeof ComponentName> = {
  title: "Shared/ComponentName",
  component: ComponentName,
  tags: ["autodocs"],
  argTypes: {
    // Props に合わせた controls
  },
  args: {
    // デフォルト引数
  },
}

export default meta

type Story = StoryObj<typeof ComponentName>

export const Default: Story = {}

export const Variant: Story = {
  args: {/* 差分 */},
}
```

title 命名規則:

- `src/project/shared/components/<name>` → `Shared/<PascalName>`
- `src/project/shared/sections/<name>` → `Shared/Sections/<PascalName>`
- `src/project/pages/<page>/components/<name>` → `Pages/<Page>/<PascalName>`
- `src/project/pages/<page>/sections/<name>` → `Pages/<Page>/Sections/<PascalName>`

ストーリーのバリエーション生成ルール:

- `variant` や `size` のような union 型の prop → それぞれ個別ストーリーを作る（例: `Primary`, `Secondary`, `Ghost`）
- 境界ケース（最長タイトル、空データ、画像なし、disabled など）は追加ストーリーとして作る
- `enabled` チェックボックスがあるセクションは `Enabled` / `Disabled` の 2 つを最低限作る
- リレーション data を受けるセクションは `mockNewsItem` 等のフィクスチャを story ファイル内で定義する（外部共有が必要になったら `src/project/shared/lib/fixtures/` に移動）

Payload セクションのストーリー生成の注意:

- セクションは `props.data` を受けるので、型に合う mock オブジェクトを story 内で定義する
- `upload` フィールドのモックは `{ url: '/demo/xxx.jpg', alt: 'サンプル画像' }` 形式（`resolveMediaUrl`/`resolveMediaAlt` が受け取れる shape）
- `relationship` フィールドのモックは depth=2 相当の展開済みオブジェクトを渡す
- `enabled: true` 前提、`enabled: false` の story は `parameters: { docs: { description: { story: '非表示時は何もレンダリングしない' } } }` と組み合わせると親切

### フェーズ4: 自己検証

- 生成後、`vp run build-storybook` が通ることを確認する
- `vp lint` を流し、stories ファイルが Oxlint を通ることを確認する
- Storybook の UI で表示確認が必要な場合はユーザーに `vp run storybook` を案内する（自動では開かない）

## ルール

- `src/core/` のコンポーネントに対してストーリーを書かない（テンプレ本体に手を入れない）
- 1 story ファイルにつき 1 コンポーネント
- story ファイルは対象コンポーネントと同じディレクトリに置く（コロケーション）
- デコレータが必要な場合（テーマ、router, Payload データ）は最小限に留め、共通化は `.storybook/preview.tsx` で行う
- hex 直書き禁止。Tailwind のテーマトークン (`src/project/theme/tailwind.theme.ts`) を使う
- `as any` 型アサーションを使わない。必要なら `Partial<T>` を使う
- `play` 関数（interaction test）は過度に書かない。視覚確認で十分な場合は書かない
