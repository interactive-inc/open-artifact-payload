# CMS設計ルール

デザイン（ワイヤーフレーム、Figma、スクリーンショット）から Payload CMS のフィールド構成を決めるときの判断基準。
セクションやコレクションの生成時に必ず読むこと。

## UI要素 → フィールド型の対応表

| UI要素                     | フィールド型                  | 備考                                        |
| -------------------------- | ----------------------------- | ------------------------------------------- |
| 1行テキスト見出し          | `text`                        |                                             |
| 複数行の説明文             | `textarea`                    |                                             |
| リッチテキスト本文         | `richText`                    | Lexical エディタ                            |
| 画像1枚                    | `upload, relationTo: 'media'` |                                             |
| 繰り返し要素（3〜6件程度） | `array` + 内部フィールド      | D1 では autosave と非互換。後述の制約を参照 |
| 他コレクションからの参照   | `relationship`                | depth 指定を忘れない                        |
| ON/OFF切り替え             | `checkbox`                    |                                             |
| 選択肢                     | `select`                      | value は英語、label は日本語                |
| リンクボタン               | `text` x2（ラベル + URL）     | name は `ctaLabel` + `ctaHref` のパターン   |
| 日付                       | `date`                        |                                             |
| 数値                       | `number`                      |                                             |

## 編集可能 vs 固定の判断基準

- お客さんが変えるもの（テキスト、画像、表示切替）→ フィールド化する
- 構造やレイアウト自体 → コードに固定する
- 判断に迷ったら「お客さんが月1回以上触りそうか」で決める
- 件数が増減するもの → Collection で管理する
- 固定個数のもの → Global の array か個別フィールドで管理する

## セクション group の必須ルール

- 全てのセクション group には `enabled` チェックボックスを最初のフィールドとして含める
- `enabled` の label は `表示する`、defaultValue は `true`（CTA系は `false`）
- フィールドラベルは日本語、フィールド名は lowerCamelCase

```ts
// 正しい例
{
  name: 'hero',
  label: 'ヒーロー',
  type: 'group',
  fields: [
    { name: 'enabled', label: '表示する', type: 'checkbox', defaultValue: true },
    { name: 'title', label: 'タイトル', type: 'text', required: true },
    // ...
  ],
}
```

## 繋ぎ込みチェックリスト

コード生成後に必ず以下を自己チェックする。1つでも不整合があれば生成をやり直す。

- Global のフィールド名とセクションコンポーネントの `props.data.xxx` 参照が完全に一致しているか
- セクションコンポーネントの先頭で `if (!props.data.enabled) return null` しているか（テンプレートはこの自己ガード方式を採用。ページ側は `<Section data={home.sectionName ?? {}} />` と無条件で渡してよい）
- `upload` フィールドの画像は `resolveMediaUrl()` / `resolveMediaAlt()` (`@/core/lib/media/resolve-media-url` / `resolve-media-alt`) で解決しているか
- `relationship` フィールドを使うページ側の `payload.findGlobal()` / `payload.find()` に `depth: 2` 以上を指定しているか
- `array` フィールドを含む Global で `autosave` を使う場合、D1 の `_uuid` カラム問題を認識しているか
- `generate:types` 後の Payload 生成型と、セクションコンポーネントの型定義が整合するか
- Tailwind クラスで hex を直書きせず `src/project/theme/tailwind.theme.ts` のトークンを使っているか

## D1 (SQLite) 固有の制約

### array + autosave の非互換

D1 では `array` フィールドと `autosave` を併用すると、マイグレーション時に `_uuid` カラムの問題が起きる。

対処法:

- `array` を含む Global では `autosave` を設定しないか、`interval` を十分長く（10000以上）にする
- または `array` の代わりに固定個数の `group` フィールドを繰り返す（3件固定なら `item1` / `item2` / `item3`）

### SQLite の二重引用符問題

マイグレーション SQL で文字列に二重引用符 `"` を使うと識別子として解釈される。文字列リテラルは必ず単一引用符 `'` を使う。

### relationship の depth 不足

`payload.findGlobal()` / `payload.find()` のデフォルト depth は 0。リレーション先は ID のみ返る。セクションでリレーション先のフィールド（title, slug, image 等）を使う場合は `depth: 2` 以上を明示する。

### select フィールドの value

value には英語を使い、label に日本語を設定する。value に日本語を使わない。

```ts
// 正しい例
{
  name: 'category',
  label: 'カテゴリ',
  type: 'select',
  options: [
    { value: 'corporate', label: '企業情報' },
    { value: 'service', label: 'サービス' },
  ],
}
```

## ファイル配置ルール

案件ファイルは `src/project/` 配下のコロケーション構造に従う。

```
src/project/
  pages/<page>/
    global.ts               Payload Global 定義。export 名は <name>Global
    sections/<name>.tsx     このページ専用のセクション
    components/ hooks/ lib/ このページ専用の補助モジュール
  shared/
    sections/               2 ページ以上で使うセクション（site-header / site-footer など）
    components/             汎用 UI コンポーネント（フラット配置）
    ui/                     shadcn/ui 所管領域（bunx shadcn add の配置先）
    hooks/ / lib/           汎用フック / util
  collections/              案件固有コレクション（news / faq / pages 以外）
  theme/                    Tailwind テーマトークン
  admin/                    管理画面カスタム
```

セクションをどこに置くか:

- そのページでしか使わない → `pages/<page>/sections/`
- 最初から 2 ページ以上で使うことが決まっている → `shared/sections/`
- 最初は 1 ページ用に作った後に再利用したくなった → `pages/*/sections/` から `shared/sections/` に移動

Global のファイル名と export:

- ファイル: `src/project/pages/<page>/global.ts`
- export: `<name>Global`（例: `homeGlobal`, `aboutGlobal`）
- `src/payload.config.ts` の `projectGlobals: [homeGlobal, ...]` に追加する

## ライブプレビュー

Global を追加するたびに、ライブプレビューが動く状態を保つ。

- Global 定義に `versions: { drafts: true }` を必ず付ける（付けないと保存 = 公開となり下書きプレビューが成立しない）
- `array` フィールドを含む Global では autosave を付けない（D1 の `_uuid` 問題に抵触する）
- `src/payload.config.ts` の `livePreviewGlobals` に Global の slug を追加する
- slug が `home-page` 以外で、かつフロントの URL パスが slug と一致しない（例: `/` を指す `home` Global）場合、`buildCoreConfig` の `livePreviewUrl` prop でマッピングを渡す:

```ts
buildCoreConfig({
  // ...
  livePreviewGlobals: ["home", "about", "service"],
  livePreviewUrl: (args) => {
    const base = process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:3000"
    const toPreview = (urlPath: string) =>
      `${base}/next/preview?path=${encodeURIComponent(urlPath)}`
    if (args.globalConfig) {
      const map: Record<string, string> = { home: "/", about: "/about" }
      return toPreview(map[args.globalConfig.slug] ?? `/${args.globalConfig.slug}`)
    }
    // ...
  },
})
```

フロントエンド側は以下のテンプレ構造が前提:

- `src/app/(frontend)/layout.tsx` は `<RefreshRouteOnSave />` を常時レンダリング
- 各 `page.tsx` は `const draftState = await draftMode()` を呼んで `payload.findGlobal({ ..., draft: draftState.isEnabled })` に渡す

## 管理画面サイドバーアイコン

新規コレクション / Global を追加してもサイドバーアイコンの個別指定は不要。
`src/app/(payload)/custom.scss` で「コンテンツグループは汎用ページアイコン (file-text) を一括適用」している。

個別にアイコンを変えたい場合だけ、`custom.scss` の「ナビアイコン」節に以下を追記する:

```scss
#nav-<slug > ::before {
  @include mask-icon($icon-xxx);
}
// Global の場合は #nav-global-<slug>
```

既存で個別指定しているのは以下のみ:

- `#nav-global-home-page` → home アイコン
- `#nav-contact-submissions` → mail アイコン
- システムグループ（users / media / site-settings）は従来どおり個別指定

## 生成時の参照指示

- 既存セクションの実装パターンは `src/core/sections/` のコードを読んで踏襲すること
- Payload のフィールド定義や API は context7 プラグインで公式ドキュメントを引くこと
- テーマトークンは `src/project/theme/tailwind.theme.ts` を参照すること
- 画像 URL は `src/core/lib/media/` の `resolveMediaUrl()` / `resolveMediaAlt()` を使うこと
- リッチテキストのレンダリングは `src/core/lib/lexical.tsx` の `RichText` コンポーネント (`<RichText data={...} />`) を使うこと
