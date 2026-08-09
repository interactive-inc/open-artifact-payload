export type SiteResourceOperation = "list" | "find" | "create" | "update" | "delete"

export type SiteResourceDefinition = {
  slug: string
  kind: "collection" | "global"
  description: string
  operations: ReadonlyArray<SiteResourceOperation>
  mcpOperations: ReadonlyArray<SiteResourceOperation>
}

export const SITE_RESOURCE_CATALOG: ReadonlyArray<SiteResourceDefinition> = Object.freeze([
  {
    slug: "media",
    kind: "collection",
    description: "サイトで利用する画像・ファイル",
    operations: ["list", "find", "create", "update", "delete"],
    mcpOperations: ["find", "create", "update"],
  },
  {
    slug: "news",
    kind: "collection",
    description: "サイトのお知らせ記事",
    operations: ["list", "find", "create", "update", "delete"],
    mcpOperations: ["find", "create", "update"],
  },
  {
    slug: "faq",
    kind: "collection",
    description: "サイトのよくある質問",
    operations: ["list", "find", "create", "update", "delete"],
    mcpOperations: ["find", "create", "update"],
  },
  {
    slug: "works",
    kind: "collection",
    description: "サイトの制作実績",
    operations: ["list", "find", "create", "update", "delete"],
    mcpOperations: ["find", "create", "update"],
  },
  {
    slug: "site-settings",
    kind: "global",
    description: "サイト名、ナビゲーション、会社情報などの共通設定",
    operations: ["find", "update"],
    mcpOperations: ["find", "update"],
  },
  {
    slug: "home-page",
    kind: "global",
    description: "トップページのコンテンツ",
    operations: ["find", "update"],
    mcpOperations: ["find", "update"],
  },
  {
    slug: "about",
    kind: "global",
    description: "会社概要ページのコンテンツ",
    operations: ["find", "update"],
    mcpOperations: ["find", "update"],
  },
  {
    slug: "service",
    kind: "global",
    description: "サービスページのコンテンツ",
    operations: ["find", "update"],
    mcpOperations: ["find", "update"],
  },
])

export function findSiteResource(slug: string): SiteResourceDefinition | Error {
  const resource = SITE_RESOURCE_CATALOG.find((candidate) => candidate.slug === slug)
  return resource ?? new Error(`Unknown resource: ${slug}. Run intacms commands to list resources.`)
}
