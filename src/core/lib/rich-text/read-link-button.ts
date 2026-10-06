import type { LinkButtonBlock } from "@/payload-types"

import { validateLinkHref } from "@/core/lib/validation/validate-link-href"

type LinkButton = {
  label: string
  href: string
  size: "standard" | "small"
  isExternal: boolean
}

/**
 * リンクボタンのブロックから表示に使う値を取り出す。
 * 下書き (自動保存・ライブプレビュー) は保存時の必須・リンク先の検証を通らずに届くため、
 * 文言かリンク先が空、またはリンク先が検証を通らなければ null を返して描画しない。
 */
export function readLinkButton(fields: Partial<LinkButtonBlock>): LinkButton | null {
  const label = fields.label?.trim() ?? ""
  const href = fields.href?.trim() ?? ""

  if (label === "" || href === "" || validateLinkHref(href) !== true) return null

  return {
    label,
    href,
    size: fields.size === "small" ? "small" : "standard",
    isExternal: href.startsWith("https://"),
  }
}
