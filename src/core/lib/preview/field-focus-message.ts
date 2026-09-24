export const fieldFocusMessageType = "cms-field-focus"

/** 管理画面からライブプレビューへ送る、フォーカス中の項目のパス。null はハイライトの解除 */
export type FieldFocusMessage = {
  type: typeof fieldFocusMessageType
  path: string | null
}

const fieldPathPattern = /^[A-Za-z0-9_]+(\.[A-Za-z0-9_]+)*$/

const maxFieldPathLength = 300

/**
 * postMessage で届いた値をフォーカス通知として読む。形の違う値や想定外の文字を含むパスは null を返して無視させる
 */
export function parseFieldFocusMessage(data: unknown): FieldFocusMessage | null {
  if (typeof data !== "object" || data === null) return null

  if (!("type" in data) || data.type !== fieldFocusMessageType || !("path" in data)) return null

  if (data.path === null) return { type: fieldFocusMessageType, path: null }

  if (typeof data.path !== "string" || data.path.length > maxFieldPathLength) return null

  if (!fieldPathPattern.test(data.path)) return null

  return { type: fieldFocusMessageType, path: data.path }
}
