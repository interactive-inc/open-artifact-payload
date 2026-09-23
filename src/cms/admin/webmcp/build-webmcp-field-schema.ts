import type { ClientField, SanitizedFieldsPermissions } from "payload"
import { z } from "zod"

import { buildWebMcpFieldsSchema } from "@/cms/admin/webmcp/build-webmcp-fields-schema"

type Props = {
  field: ClientField
  permissions: SanitizedFieldsPermissions
  operation: "create" | "update"
}

/** Preserve structured values for arrays, relationships and Payload's Lexical rich text. */
export function buildWebMcpFieldSchema(props: Props): z.ZodType {
  const field = props.field

  if (field.type === "group") return buildWebMcpFieldsSchema({ ...props, fields: field.fields })
  if (field.type === "array")
    return z.array(
      buildWebMcpFieldsSchema({ ...props, fields: field.fields }).extend({
        id: z.string().optional(),
      }),
    )
  if (field.type === "checkbox") return z.boolean()
  if (field.type === "number")
    return "hasMany" in field && field.hasMany ? z.array(z.number()) : z.number()
  if (field.type === "select" || field.type === "radio") {
    const options = z.enum(
      field.options.map((option) => (typeof option === "string" ? option : option.value)),
    )

    return "hasMany" in field && field.hasMany ? z.array(options) : options
  }
  if (field.type === "relationship" || field.type === "upload") {
    const id = z.union([z.number(), z.string()])
    const relation =
      typeof field.relationTo === "string"
        ? id
        : z.strictObject({ relationTo: z.enum(field.relationTo), value: id })

    return "hasMany" in field && field.hasMany ? z.array(relation) : relation
  }
  if (field.type === "richText")
    return z
      .object({ root: z.record(z.string(), z.json()) })
      .describe(
        "Payload Lexical JSON. Read the current document for its structure; use a root with paragraph and text nodes.",
      )
  if (field.type === "json") return z.json()
  if (field.type === "point") return z.tuple([z.number(), z.number()])
  if (field.type === "blocks")
    return z.never().describe("Use the regular block editor for this field")

  return "hasMany" in field && field.hasMany ? z.array(z.string()) : z.string()
}
