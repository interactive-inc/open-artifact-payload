import type { ClientField, SanitizedFieldsPermissions } from "payload"
import { z } from "zod"

import { buildWebMcpFieldSchema } from "@/cms/admin/webmcp/build-webmcp-field-schema"

type Props = {
  fields: ClientField[]
  permissions: SanitizedFieldsPermissions
  operation: "create" | "update"
}

/** Derive editable fields from Payload's client schema and document-level permissions. */
export function buildWebMcpFieldsSchema(props: Props): z.ZodObject<Record<string, z.ZodType>> {
  const shape: Record<string, z.ZodType> = {}

  for (const field of props.fields) {
    if (
      field.type === "ui" ||
      field.type === "join" ||
      field.admin?.hidden ||
      field.admin?.readOnly
    )
      continue
    if (field.type === "tabs") {
      for (const tab of field.tabs) {
        if ("name" in tab && tab.name) {
          const permission = props.permissions === true ? true : props.permissions[tab.name]
          if (!permission || (permission !== true && permission[props.operation] !== true)) continue
          shape[tab.name] = buildWebMcpFieldsSchema({
            ...props,
            fields: tab.fields,
            permissions: permission === true ? true : (permission.fields ?? {}),
          }).optional()
        } else {
          Object.assign(shape, buildWebMcpFieldsSchema({ ...props, fields: tab.fields }).shape)
        }
      }
      continue
    }
    if (!("name" in field)) {
      if ("fields" in field)
        Object.assign(shape, buildWebMcpFieldsSchema({ ...props, fields: field.fields }).shape)
      continue
    }
    if (["id", "_status", "createdAt", "updatedAt"].includes(field.name) || field.hidden) continue

    const permission = props.permissions === true ? true : props.permissions[field.name]

    if (!permission || (permission !== true && permission[props.operation] !== true)) continue

    const schema = buildWebMcpFieldSchema({
      field,
      permissions: permission === true ? true : (permission.fields ?? {}),
      operation: props.operation,
    })
    const label = typeof field.label === "string" ? field.label : field.name

    shape[field.name] = schema
      .nullable()
      .optional()
      .describe(`${label}${"required" in field && field.required ? " (required when saving)" : ""}`)
  }

  return z.strictObject(shape)
}
