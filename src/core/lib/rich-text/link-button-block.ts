import type { Block } from "payload"

import { HREF_MAX_LENGTH, SHORT_TEXT_MAX_LENGTH } from "@/core/lib/validation/text-limits"
import { validateLinkHref } from "@/core/lib/validation/validate-link-href"

/** 本文に差し込む、矢印付きのリンクボタン。https:// の URL は外部リンクとして別タブで開く。 */
export const linkButtonBlock: Block = {
  slug: "linkButton",
  interfaceName: "LinkButtonBlock",
  labels: { singular: "リンクボタン", plural: "リンクボタン" },
  // ブロックごとの名前欄 (未入力だと Untitled と出る) は使わないので隠す
  admin: { disableBlockName: true },
  fields: [
    {
      name: "label",
      label: "ボタンの文言",
      type: "text",
      required: true,
      maxLength: SHORT_TEXT_MAX_LENGTH,
    },
    {
      name: "href",
      label: "リンク先",
      type: "text",
      required: true,
      maxLength: HREF_MAX_LENGTH,
      validate: validateLinkHref,
      admin: {
        description:
          "サイト内は / から始まるパス、外部サイトは https:// から入力します。外部サイトは別タブで開きます。",
      },
    },
    {
      name: "size",
      label: "大きさ",
      type: "select",
      required: true,
      defaultValue: "standard",
      options: [
        { value: "standard", label: "標準" },
        { value: "small", label: "小" },
      ],
    },
  ],
}
