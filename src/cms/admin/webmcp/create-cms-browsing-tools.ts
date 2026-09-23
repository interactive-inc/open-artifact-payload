import { z } from "zod"

import { createWebMcpTool } from "@/cms/admin/webmcp/create-webmcp-tool"
import { readWebMcpResource } from "@/cms/admin/webmcp/read-webmcp-resource"
import type { webMcpResources } from "@/cms/admin/webmcp/webmcp-resources"

type Props = {
  resources: typeof webMcpResources
  apiRoute: string
  adminRoute: string
  locale: string
}

/** Discover content and open its existing editor without issuing independent REST writes. */
export function createCmsBrowsingTools(props: Props) {
  const resourceSchema = z.enum(props.resources.map((resource) => resource.slug))
  const idSchema = z.union([z.number().int().positive(), z.string().regex(/^[a-zA-Z0-9_-]+$/)])

  return [
    createWebMcpTool({
      name: "cms_list_resources",
      description:
        "List the CMS content available to the signed-in user. Open an editor to create or edit content. User accounts, inquiries and credentials are not exposed.",
      schema: z.strictObject({}),
      readOnly: true,
      execute: () => ({ resources: props.resources, locale: props.locale }),
    }),
    createWebMcpTool({
      name: "cms_read_content",
      description:
        "Read saved CMS content by resource and optional ID, or search a collection by title. Includes drafts permitted by the current login. For unsaved editor values use cms_get_current_document.",
      schema: z.strictObject({
        resource: resourceSchema,
        id: idSchema.optional(),
        query: z.string().max(200).optional(),
        page: z.number().int().min(1).default(1),
        limit: z.number().int().min(1).max(50).default(10),
      }),
      readOnly: true,
      execute: (input, execution) => {
        const resource = props.resources.find((candidate) => candidate.slug === input.resource)

        if (!resource) return { ok: false, error: "Resource is unavailable" }

        const route = resource.kind === "global" ? `globals/${resource.slug}` : resource.slug
        const suffix = resource.kind === "collection" && input.id ? `/${input.id}` : ""
        const url = new URL(`${props.apiRoute}/${route}${suffix}`, window.location.origin)

        url.search = new URLSearchParams({
          locale: props.locale,
          depth: "0",
          draft: "true",
          "fallback-locale": "null",
          page: String(input.page),
          limit: String(input.limit),
        }).toString()
        if (input.query && resource.titleField)
          url.searchParams.set(`where[${resource.titleField}][contains]`, input.query)

        return readWebMcpResource(url, execution)
      },
    }),
    createWebMcpTool({
      name: "cms_open_document",
      description:
        "Open the existing CMS editor. For collections pass an ID, or omit it to create a document. Normal unsaved-change navigation protection applies. Discover the new page's tools after navigation.",
      schema: z.strictObject({ resource: resourceSchema, id: idSchema.optional() }),
      readOnly: false,
      execute: (input) => {
        const resource = props.resources.find((candidate) => candidate.slug === input.resource)

        if (!resource) return { ok: false, error: "Resource is unavailable" }

        const route =
          resource.kind === "global"
            ? `globals/${resource.slug}`
            : `collections/${resource.slug}/${input.id ?? "create"}`
        const url = `${props.adminRoute}/${route}/?locale=${encodeURIComponent(props.locale)}`

        window.location.assign(url)

        return { navigationRequested: true, url }
      },
    }),
  ]
}
