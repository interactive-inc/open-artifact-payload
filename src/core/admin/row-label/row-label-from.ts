import type { RowLabelComponent } from "payload"

/**
 * array フィールドの admin.components.RowLabel に渡す設定。
 * fieldName の入力値を行の見出しにし、未入力なら「<fallback> 01」と表示する。
 */
export function rowLabelFrom(fieldName: string, fallback: string): RowLabelComponent {
  return {
    path: "@/core/admin/row-label/array-row-label#ArrayRowLabel",
    clientProps: { fieldName, fallback },
  }
}
