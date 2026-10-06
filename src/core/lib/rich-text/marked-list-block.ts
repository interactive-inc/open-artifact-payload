import type { Block } from "payload"

import { LONG_TEXT_MAX_LENGTH } from "@/core/lib/validation/text-limits"

/**
 * 「1）」「ア、」「※」の記号を付けるリスト。エディタ標準のリストは「・」と「1.」しか選べないため、
 * 記号の種類を選べるブロックにする。各項目は文字だけで、太字やリンクは入れられない。
 */
export const markedListBlock: Block = {
  slug: "markedList",
  interfaceName: "MarkedListBlock",
  labels: { singular: "記号付きリスト", plural: "記号付きリスト" },
  // ブロックごとの名前欄 (未入力だと Untitled と出る) は使わないので隠す
  admin: { disableBlockName: true },
  fields: [
    {
      name: "marker",
      label: "記号",
      type: "select",
      required: true,
      defaultValue: "parenNumber",
      options: [
        { value: "parenNumber", label: "番号（括弧）1）2）3）" },
        { value: "katakana", label: "カタカナ ア、イ、ウ、" },
        { value: "note", label: "注釈 ※" },
      ],
    },
    {
      name: "items",
      label: "項目",
      type: "textarea",
      required: true,
      maxLength: LONG_TEXT_MAX_LENGTH,
      admin: { description: "1行が1項目になります。空の行は表示しません。" },
    },
  ],
}
