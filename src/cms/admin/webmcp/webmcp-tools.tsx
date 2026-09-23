"use client"

import { registerWebMcpTools } from "@/cms/admin/webmcp/register-webmcp-tools"
import type { WebMcpTool } from "@/cms/admin/webmcp/webmcp-types"

type Props = { tools: ReadonlyArray<WebMcpTool> }

/** Callback-ref cleanup removes page tools on navigation, logout and React remounts. */
export function WebMcpTools(props: Props) {
  return (
    <span
      hidden
      ref={(element) => {
        if (element) return registerWebMcpTools(element, props.tools)
      }}
    />
  )
}
