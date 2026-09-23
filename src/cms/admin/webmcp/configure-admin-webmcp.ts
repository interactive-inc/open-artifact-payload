import type { SanitizedConfig } from "payload"

import { webMcpResources } from "@/cms/admin/webmcp/webmcp-resources"

/** Add the project-owned integration without changing the template core or MCP server. */
export function configureAdminWebMcp(config: SanitizedConfig) {
  const component = "@/cms/admin/webmcp/document-webmcp-tools#DocumentWebMcpTools"

  config.admin.components.providers = [
    ...(config.admin.components.providers ?? []),
    "@/cms/admin/webmcp/admin-webmcp-provider#AdminWebMcpProvider",
  ]
  for (const collection of config.collections) {
    if (
      !webMcpResources.some(
        (resource) => resource.kind === "collection" && resource.slug === collection.slug,
      )
    )
      continue

    const edit = collection.admin.components?.edit

    collection.admin.components = {
      ...collection.admin.components,
      edit: {
        ...edit,
        beforeDocumentControls: [...(edit?.beforeDocumentControls ?? []), component],
      },
    }
  }
  for (const global of config.globals) {
    if (
      !webMcpResources.some(
        (resource) => resource.kind === "global" && resource.slug === global.slug,
      )
    )
      continue

    const elements = global.admin.components?.elements

    global.admin.components = {
      ...global.admin.components,
      elements: {
        ...elements,
        beforeDocumentControls: [...(elements?.beforeDocumentControls ?? []), component],
      },
    }
  }

  return config
}
