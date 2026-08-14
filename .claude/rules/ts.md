---
paths:
  - "**/*.ts"
  - "**/*.tsx"
---

## ファイル

- 1ファイル1関数 or 1クラス。ファイル名 = 関数名/クラス名（小文字ケバブケース）
- バレルファイル（`index.ts` で配下を re-export するだけのファイル）禁止。ライブラリの公開エントリのみ例外

## import

- `@/` 絶対パス、相対パス禁止
- 動的 import 禁止（`await import(...)` / `import()` expression）。static `import` 文のみ

## 型

- type のみ、interface と enum 禁止
- unknown のみ、any と as 禁止
- `as unknown as T` は最終手段のみ。使いたくなったら手を止めて根本原因を調べる
- 値がないことは null（空文字や optional でなく `string | null`）
- Zod スキーマから `z.infer` で型を生成する

## 命名

- 省略しない。`data` / `result` / `items` など汎用名を避ける
- 配列は複数形、Boolean は `is` / `has` / `can`
- メソッド: `with*()` 変換、`to*()` 出力、`get*()` 取得
- ファイル内に1つだけの Props / Deps 型は `Props` / `Deps` のまま。`ChannelServiceDeps` のようなプレフィックスは付けない
- export して名前空間が衝突する場合のみ長い名前にする

## 関数

- 引数は3個まで、4個以上は `props: Props`
- 20行以内、純粋関数を優先

## クラス

- `constructor(private readonly props: Props)` + `Object.freeze(this)`
- `with*()` で不変更新、配列は ReadonlyArray

## 変数・制御フロー

- const のみ、destructuring 禁止
- for-of、early return、if を使う（switch 禁止。ただし Reducer の Action 分岐は exhaustive switch）

## エラー

- バックエンドは throw 禁止、`T | Error` を返し instanceof で判別

## 空行

- 処理と処理の間に1行の空行を入れる。インデント2段目まで適用、3段目以降は詰める

```ts
export function run() {
  const x = 0

  console.log(x)

  if (x === 0) {
    const y = 1
    console.log(y)
  }
}
```

## コメント

- 動作が予測しにくい場合のみ。@param, @return 禁止

## 適用除外

上記ルールは手書きのプロダクトコードが対象。以下はフレームワークやツールと衝突するため対象外。

- 自動生成ファイル: `src/payload-types.ts` / `cloudflare-env.d.ts` / `src/migrations/index.ts` / `src/app/(payload)/` 配下の Payload 生成ルート。手編集禁止、index.ts・複数 export・assertion のルールは適用しない
- React フックのタプル: `useState` / `useActionState` / `useReducer` の戻り値は配列 destructuring 可（index アクセスは非イディオム的で可読性が落ちる）
- テストファイル (`tests/**`): `beforeAll` で代入するフィクスチャの `let`、`tests/helpers/*` の複数 export、フレームワーク慣習の destructuring（Playwright の `async ({ page }) =>` 等）は許可。フレームワークオブジェクトの部分モック構築に限り型 assertion も許可（Payload hook 引数 / `PayloadRequest` 等）
- 外部ライブラリ型との接続: サードパーティ型の完全な構造を満たすのが非現実的な場合（`config-base.ts` の pino `Logger` 等）、説明コメント付きの assertion を1箇所だけ許可
- Storybook ストーリー (`**/*.stories.tsx`): CSF の仕様上 `export default meta` + ストーリーごとの named export が必要なため、複数 export を許可
