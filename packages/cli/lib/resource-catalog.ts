import { SITE_RESOURCE_CATALOG, type SiteResourceDefinition } from "@open-artifact/site-management"

export { findSiteResource } from "@open-artifact/site-management"

export function searchSiteCommands(query: string | null): ReadonlyArray<{
  command: string
  description: string
}> {
  const commands = SITE_RESOURCE_CATALOG.flatMap((resource) =>
    resource.operations.map((operation) => ({
      command: toCommandName(resource, operation),
      description: `${resource.description}を${toOperationLabel(operation)}`,
    })),
  )
  if (query === null) return commands

  const normalized = query.toLowerCase()
  return commands.filter(
    (command) =>
      command.command.toLowerCase().includes(normalized) ||
      command.description.toLowerCase().includes(normalized),
  )
}

function toCommandName(
  resource: SiteResourceDefinition,
  operation: SiteResourceDefinition["operations"][number],
): string {
  if (resource.kind === "global") {
    return operation === "find"
      ? `intacms ${resource.slug}`
      : `intacms ${resource.slug} ${operation}`
  }

  if (operation === "list") return `intacms ${resource.slug}`
  if (operation === "create") return `intacms ${resource.slug} create`
  if (operation === "find") return `intacms ${resource.slug} <id>`
  return `intacms ${resource.slug} <id> ${operation}`
}

function toOperationLabel(operation: SiteResourceDefinition["operations"][number]): string {
  const labels = {
    list: "一覧表示する",
    find: "取得する",
    create: "作成する",
    update: "更新する",
    delete: "削除する",
  } satisfies Record<SiteResourceDefinition["operations"][number], string>
  return labels[operation]
}
