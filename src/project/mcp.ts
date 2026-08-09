import type { MCPPluginConfig } from "@payloadcms/plugin-mcp"
import { SITE_RESOURCE_CATALOG } from "@open-artifact/site-management"
import { UnauthorizedError } from "payload"

import { hasAdminRole } from "@/core/lib/access/has-admin-role"
import { isAdmin } from "@/core/lib/access/is-admin"

const mcpKeyLifetimeMilliseconds = 90 * 24 * 60 * 60 * 1000

const collections = Object.fromEntries(
  SITE_RESOURCE_CATALOG.filter((resource) => resource.kind === "collection").map((resource) => [
    resource.slug,
    {
      description: `${resource.description}を検索、登録、更新する`,
      enabled: {
        find: resource.mcpOperations.includes("find"),
        create: resource.mcpOperations.includes("create"),
        update: resource.mcpOperations.includes("update"),
        delete: resource.mcpOperations.includes("delete"),
      },
    },
  ]),
)

const globals = Object.fromEntries(
  SITE_RESOURCE_CATALOG.filter((resource) => resource.kind === "global").map((resource) => [
    resource.slug,
    {
      description: `${resource.description}を取得・更新する`,
      enabled: {
        find: resource.mcpOperations.includes("find"),
        update: resource.mcpOperations.includes("update"),
      },
    },
  ]),
)

/**
 * MCPへ公開するPayloadリソースの上限。
 *
 * 実際の権限は、ここで許可した操作の範囲内でMCP API Keyごとに絞り込む。
 * Payload本体のaccess制御も常に適用されるため、両方を満たす操作だけが実行される。
 */
export const projectMcpConfig = {
  collections,
  globals,
  overrideApiKeyCollection: (collection) => ({
    ...collection,
    access: {
      ...collection.access,
      admin: (args) => hasAdminRole(args.req.user),
      create: isAdmin,
      read: isAdmin,
      update: isAdmin,
      delete: isAdmin,
    },
    fields: [
      ...collection.fields,
      {
        name: "expiresAt",
        type: "date",
        defaultValue: () => new Date(Date.now() + mcpKeyLifetimeMilliseconds).toISOString(),
        admin: {
          description:
            "この日時を過ぎるとMCP接続を拒否します。未設定の既存キーも安全のため拒否されます。",
          position: "sidebar",
        },
      },
    ],
  }),
  overrideAuth: async (_request, getDefaultMcpAccessSettings) => {
    const settings = await getDefaultMcpAccessSettings()
    if (isExpiredMcpKey(settings)) throw new UnauthorizedError()
    return settings
  },
  mcp: {
    serverOptions: {
      instructions:
        "サイトコンテンツの検索・登録・更新にはPayload標準ツールを使う。削除はMCPに公開していない。公開状態やロケールを確認し、更新は利用者の明示的な指示がある場合だけ実行する。",
      serverInfo: {
        name: "Open Artifact Payload",
        version: "1.0.0",
      },
    },
  },
} satisfies MCPPluginConfig

function isExpiredMcpKey(settings: unknown): boolean {
  if (typeof settings !== "object" || settings === null) return true
  const expiresAt = Reflect.get(settings, "expiresAt")
  if (typeof expiresAt !== "string") return true
  const expiration = Date.parse(expiresAt)
  return Number.isNaN(expiration) || expiration <= Date.now()
}
