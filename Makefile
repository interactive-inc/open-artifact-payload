# Cloudflare デプロイ用タスク。
# cross-env を介さず素のシェルで環境変数を渡す。対象環境は常に明示する。
# 環境を切り替える場合は `make deploy CLOUDFLARE_ENV=staging` のように上書きする。

# make の素のシェルは node_modules/.bin を解決しないため PATH に追加する
export PATH := $(CURDIR)/node_modules/.bin:$(PATH)
export CLOUDFLARE_ENV ?= production

.PHONY: deploy deploy-app deploy-db deploy-preflight preview storybook shadcn-add

# DB マイグレーション + アプリデプロイ
deploy: deploy-db deploy-app

# Worker / D1 / R2 / Account ID の取り違えと、必須 secret の登録漏れをデプロイ前に検出
deploy-preflight:
	vp run cloudflare:preflight -- --env=$(CLOUDFLARE_ENV)
	vp run cloudflare:preflight-secrets -- --env=$(CLOUDFLARE_ENV)

# アプリのみデプロイ
deploy-app: deploy-preflight
	opennextjs-cloudflare build --env=$(CLOUDFLARE_ENV)
	opennextjs-cloudflare deploy --env=$(CLOUDFLARE_ENV)

# DB マイグレーションのみ
deploy-db: deploy-preflight
	NODE_ENV=production PAYLOAD_SECRET=ignore payload migrate
	wrangler d1 execute D1 --command 'PRAGMA optimize' --env=$(CLOUDFLARE_ENV) --remote

# ローカルプレビュー。本番環境を指定せず、トップレベルのローカル binding だけを使う
preview:
	opennextjs-cloudflare build
	opennextjs-cloudflare preview

# Storybook (portless 経由で https://storybook.payload.artifacts.open.localhost)
storybook:
	portless storybook.payload.artifacts.open vp run storybook

# shadcn コンポーネント全追加
shadcn-add:
	bunx shadcn add -o -y -a
