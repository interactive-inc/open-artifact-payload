---
name: verify
description: この Payload CMS テンプレートの変更を実際に動かして検証する手順。dev サーバー起動、管理画面ログイン、AI翻訳エンドポイントの叩き方。
---

# 検証手順

## 起動

- `.env` に `PAYLOAD_SECRET=<任意の文字列>` と `NEXT_PUBLIC_SERVER_URL=http://localhost:3000` が必要（無いと Payload が起動時に落ちる）
- `.claude/launch.json` の `dev`（`bun dev` / port 3000）を preview_start で起動する
- 初回アクセスは `/admin` のコンパイルで数秒かかる。navigate が失敗したら少し待って再試行

## 管理画面ログイン

- ローカル D1 は `.wrangler/state/v3/d1/miniflare-D1DatabaseObject/*.sqlite`
- 統合テストが作った admin ユーザーを使う: `sqlite3 <db> "select u.email from users u join users_roles r on r.parent_id=u.id where r.value='admin' order by u.id desc limit 3;"`
- テストユーザーのパスワードは `test-password-1234`

## REST での検証

- ログイン: `POST /api/users/login` に email / password を送ると `token` が返る
- 以降 `Authorization: JWT <token>` ヘッダーで叩く
- AI翻訳: `POST /api/ai-translate` に `{targetKind, targetSlug, targetId, targetLocale, overwrite}` を送る
- AI翻訳設定の切り替え: `POST /api/globals/ai-translation-settings` に `{"enabled": true}` など

## 注意

- `wrangler types`（`vp run generate:types` の前半）は `.env` の内容から env 型を生成するため、シークレットが揃っていない環境で実行すると `cloudflare-env.d.ts` が痩せる。差分を確認し、意図しない変更なら `git restore cloudflare-env.d.ts` で戻す
- `vp run payload --` 系 CLI は `PAYLOAD_SECRET=test-secret-do-not-use-in-production` を付ければ `.env` 無しでも動く
