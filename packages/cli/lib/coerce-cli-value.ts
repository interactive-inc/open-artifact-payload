import { jsonValueSchema, type JsonValue } from "@open-artifact/site-management"

const numberPattern = /^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?$/

export function coerceCliValue(value: string): JsonValue {
  if (value === "true") return true
  if (value === "false") return false
  if (value === "null") return null
  if (numberPattern.test(value)) return Number(value)

  if (
    (value.startsWith("{") && value.endsWith("}")) ||
    (value.startsWith("[") && value.endsWith("]")) ||
    (value.startsWith('"') && value.endsWith('"'))
  ) {
    try {
      const parsed = jsonValueSchema.safeParse(JSON.parse(value))
      if (parsed.success) return parsed.data
    } catch {
      return value
    }
  }

  return value
}
