# Cloudflare デプロイ用タスク。
# cross-env を介さず素のシェルで環境変数を渡す。アカウント / 環境は wrangler.jsonc 側で固定済み。
# 環境を切り替える場合は `make deploy CLOUDFLARE_ENV=staging` のように上書きする。

# bun run と違い make の素のシェルは node_modules/.bin を解決しないため PATH に追加する
export PATH := $(CURDIR)/node_modules/.bin:$(PATH)
export CLOUDFLARE_ENV ?= production

.PHONY: deploy deploy-app deploy-db preview storybook shadcn-add

# DB マイグレーション + アプリデプロイ
deploy: deploy-db deploy-app

# アプリのみデプロイ
deploy-app:
	opennextjs-cloudflare build --env=$(CLOUDFLARE_ENV)
	opennextjs-cloudflare deploy --env=$(CLOUDFLARE_ENV)

# DB マイグレーションのみ
deploy-db:
	NODE_ENV=production PAYLOAD_SECRET=ignore payload migrate
	wrangler d1 execute D1 --command 'PRAGMA optimize' --env=$(CLOUDFLARE_ENV) --remote

# ローカルプレビュー
preview:
	opennextjs-cloudflare build
	opennextjs-cloudflare preview --env=$(CLOUDFLARE_ENV)

# Storybook (portless 経由で https://storybook.payload.artifacts.open.localhost)
storybook:
	portless storybook.payload.artifacts.open bun run storybook

# shadcn コンポーネント全追加
shadcn-add:
	bunx --bun shadcn@latest add --all --overwrite --yes
