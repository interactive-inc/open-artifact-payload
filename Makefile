# Cloudflare デプロイ用タスク。
# cross-env を介さず素のシェルで環境変数を渡す。対象環境は常に明示する。
# 環境を切り替える場合は `make deploy CLOUDFLARE_ENV=staging` のように上書きする。

# node_modules/.bin の CLI は vp exec 経由で呼ぶ。make の PATH に .bin を足す方法は、
# macOS 標準の GNU make 3.81 が単純コマンドをシェルを介さず直接 exec するため効かない。

.PHONY: deploy deploy-app deploy-db deploy-preflight preview storybook shadcn-add worktree

# CLOUDFLARE_ENV はデプロイ系 target だけに export する。wrangler と Payload CLI は環境変数
# CLOUDFLARE_ENV を読むため、全体に export すると preview や worktree のローカル操作まで
# 本番環境の bindings を参照してしまう。
deploy deploy-app deploy-db deploy-preflight: export CLOUDFLARE_ENV ?= production

# DB マイグレーション + アプリデプロイ
deploy: deploy-db deploy-app

# Worker / D1 / R2 / Account ID の取り違えと、必須 secret の登録漏れをデプロイ前に検出
deploy-preflight:
	vp run cloudflare:preflight -- --env=$(CLOUDFLARE_ENV)
	vp run cloudflare:preflight-secrets -- --env=$(CLOUDFLARE_ENV)

# アプリのみデプロイ
deploy-app: deploy-preflight
	vp exec opennextjs-cloudflare build --env=$(CLOUDFLARE_ENV)
	vp exec opennextjs-cloudflare deploy --env=$(CLOUDFLARE_ENV)

# DB マイグレーションのみ。remote D1 へ当てるのはこの target だけ。
# CLOUDFLARE_REMOTE_BINDINGS=true を明示した Payload CLI だけが remote binding を使う
# (src/core/payload/resolve-cloudflare-context-mode.ts を参照)。
deploy-db: deploy-preflight
	NODE_ENV=production CLOUDFLARE_REMOTE_BINDINGS=true PAYLOAD_SECRET=ignore vp exec payload migrate
	vp exec wrangler d1 execute D1 --command 'PRAGMA optimize' --env=$(CLOUDFLARE_ENV) --remote

# ローカルプレビュー。本番環境を指定せず、トップレベルのローカル binding だけを使う
preview:
	vp exec opennextjs-cloudflare build
	vp exec opennextjs-cloudflare preview

# Storybook (portless 経由で https://storybook.payload.artifacts.open.localhost)
storybook:
	portless storybook.payload.artifacts.open vp run storybook

# shadcn コンポーネント全追加
shadcn-add:
	bunx shadcn add -o -y -a

# Linked worktree の初期化。依存導入、.env の用意、ローカル D1 のマイグレーションを 1 回で行う。
# .env は primary checkout のものを引き継ぎ、無ければ .env.example から PAYLOAD_SECRET 付きで生成する。
# ローカル D1 (.wrangler/state) は worktree ごとに独立させ、他の作業ツリーのデータを共有しない。
worktree:
	vp install --frozen-lockfile
	@if [ ! -f .env ]; then \
		primary="$$(cd "$$(git rev-parse --git-common-dir)/.." && pwd)"; \
		if [ -f "$$primary/.env" ]; then \
			cp "$$primary/.env" .env; \
			echo "worktree: copied .env from $$primary"; \
		else \
			{ echo "PAYLOAD_SECRET=$$(openssl rand -hex 32)"; grep -v '^PAYLOAD_SECRET=' .env.example; } > .env; \
			echo "worktree: generated .env from .env.example"; \
		fi; \
	fi
	vp run payload migrate
