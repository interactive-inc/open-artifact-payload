"use client"

import {
  useAuth,
  useConfig,
  useDocumentInfo,
  useEditDepth,
  useWatchForm,
  useFormBackgroundProcessing,
  useFormProcessing,
  useLocale,
} from "@payloadcms/ui"
import { useRef } from "react"

import { createCmsDocumentTools } from "@/cms/admin/webmcp/create-cms-document-tools"
import { webMcpResources } from "@/cms/admin/webmcp/webmcp-resources"
import { WebMcpTools } from "@/cms/admin/webmcp/webmcp-tools"

/** Bind tools to the top-level document editor, never a nested relationship drawer. */
export function DocumentWebMcpTools() {
  const auth = useAuth()
  const configuration = useConfig()
  const document = useDocumentInfo()
  const form = useWatchForm()
  const locale = useLocale()
  const depth = useEditDepth()
  const isProcessing = useFormProcessing()
  const isBackgroundProcessing = useFormBackgroundProcessing()
  const mutation = useRef(false)
  const slug = document.collectionSlug ?? document.globalSlug

  if (!auth.user || depth > 1 || !webMcpResources.some((resource) => resource.slug === slug))
    return null

  return (
    <WebMcpTools
      tools={createCmsDocumentTools({
        form,
        document,
        locale: locale?.code ?? "ja",
        apiRoute: configuration.config.routes.api,
        isProcessing: isProcessing || isBackgroundProcessing,
        mutation,
      })}
    />
  )
}
