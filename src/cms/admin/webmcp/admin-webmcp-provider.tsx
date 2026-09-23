"use client"

import { useAuth, useConfig, useLocale } from "@payloadcms/ui"
import type { ReactNode } from "react"

import { createCmsBrowsingTools } from "@/cms/admin/webmcp/create-cms-browsing-tools"
import { webMcpResources } from "@/cms/admin/webmcp/webmcp-resources"
import { WebMcpTools } from "@/cms/admin/webmcp/webmcp-tools"

type Props = { children?: ReactNode }

/** Offer site tools only inside an authenticated Payload admin session. */
export function AdminWebMcpProvider(props: Props) {
  const auth = useAuth()
  const configuration = useConfig()
  const locale = useLocale()
  const resources = webMcpResources.filter((resource) => {
    const permissions =
      resource.kind === "collection" ? auth.permissions?.collections : auth.permissions?.globals

    return permissions?.[resource.slug]?.read === true
  })
  const tools =
    auth.user && resources.length > 0
      ? createCmsBrowsingTools({
          resources,
          apiRoute: configuration.config.routes.api,
          adminRoute: configuration.config.routes.admin,
          locale: locale?.code ?? "ja",
        })
      : []

  return (
    <>
      {props.children}
      <WebMcpTools tools={tools} />
    </>
  )
}
